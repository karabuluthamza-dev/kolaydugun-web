import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePlanning } from '../context/PlanningContext';
import { AiGateway } from '../services/ai/AiGateway';
import { aiChatService } from '../services/ai/AiChatService';
import { chatSessionService } from '../services/ai/ChatSessionService';
import { handoffService, HANDOFF_CHANNELS } from '../services/ai/handoffService';
import { 
    MessageSquare, X, Send, Trash2, Plus, 
    AlertCircle, RefreshCw, LogIn, UserPlus, Phone 
} from 'lucide-react';
import './AiChatDrawer.css';

export const AiChatDrawer = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    
    const planningData = usePlanning() || {};

    const [isEnabled, setIsEnabled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    
    const messageEndRef = useRef(null);

    // 1. Check Feature Flag
    useEffect(() => {
        const checkFeatureFlag = async () => {
            try {
                const flag = await AiGateway.getFeatureFlag('global_drawer');
                setIsEnabled(flag);
            } catch (err) {
                console.error('[AiChatDrawer] Feature flag check failed:', err);
                setIsEnabled(false);
            }
        };
        checkFeatureFlag();
    }, []);

    // 2. Fetch Sessions on Login / Open
    useEffect(() => {
        if (isEnabled && user && isOpen) {
            loadSessions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled, user, isOpen]);

    // 3. Auto Scroll to Bottom on New Messages / Typing
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAiTyping]);

    const loadSessions = async () => {
        setIsSessionsLoading(true);
        try {
            const list = await chatSessionService.fetchSessions(user.id);
            setSessions(list);
            
            if (list.length > 0) {
                // Load the first (most recent) session
                setActiveSessionId(list[0].id);
                loadMessages(list[0].id);
            } else {
                // Auto create first session if none exists
                await handleCreateSession();
            }
        } catch (err) {
            console.error('[AiChatDrawer] Failed to load sessions:', err);
        } finally {
            setIsSessionsLoading(false);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const history = await chatSessionService.fetchMessages(sessionId);
            
            // Map db messages to UI state containing local status fields
            const mapped = history.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                status: msg.metadata?.status || 'sent'
            }));

            setMessages(mapped);
        } catch (err) {
            console.error('[AiChatDrawer] Failed to load messages:', err);
        }
    };

    const handleCreateSession = async () => {
        if (!user) return;
        try {
            const sessionTitle = `${t('aiChat.newChat') || 'Yeni Sohbet'} - ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US')}`;
            const newSession = await chatSessionService.createSession(user.id, sessionTitle);
            
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            
            // Insert welcome message initially
            const welcomeText = t('aiChat.welcomeMessage');
            const welcomeMsg = await chatSessionService.saveMessage({
                session_id: newSession.id,
                role: 'assistant',
                content: welcomeText,
                metadata: { status: 'sent' }
            });

            setMessages([{
                id: welcomeMsg.id,
                role: 'assistant',
                content: welcomeText,
                status: 'sent'
            }]);
        } catch (err) {
            console.error('[AiChatDrawer] Failed to create session:', err);
        }
    };

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();
        try {
            await chatSessionService.deleteSession(sessionId);
            const remaining = sessions.filter(s => s.id !== sessionId);
            setSessions(remaining);
            
            if (activeSessionId === sessionId) {
                if (remaining.length > 0) {
                    setActiveSessionId(remaining[0].id);
                    loadMessages(remaining[0].id);
                } else {
                    setActiveSessionId(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('[AiChatDrawer] Failed to delete session:', err);
        }
    };

    const handleSendMessage = async (textToSend) => {
        if (!textToSend.trim() || !activeSessionId) return;
        
        // Generate temporary local ID for UI state management
        const tempId = `temp-${Date.now()}`;
        const userMsg = {
            id: tempId,
            role: 'user',
            content: textToSend,
            status: 'sending'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsAiTyping(true);

        let savedMsg = null;
        try {
            // 1. Save user message to Supabase
            savedMsg = await chatSessionService.saveMessage({
                session_id: activeSessionId,
                role: 'user',
                content: textToSend,
                metadata: { status: 'sent' }
            });

            // Update UI message status to sent, and replace temp ID with DB ID
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: savedMsg.id, status: 'sent' } : m));
        } catch (err) {
            console.error('[AiChatDrawer] Failed to save user message to DB:', err);
            // Mark user message as failed in UI
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
            setIsAiTyping(false);
            return; // Don't call AI if we couldn't save the message
        }

        // 2. Generate response from AI service
        try {
            // Get past history formatted for AI service (only sent messages)
            const chatHistory = messages
                .filter(m => m.role !== 'system' && m.status === 'sent')
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            const aiResponse = await aiChatService.sendMessage(
                textToSend, 
                chatHistory, 
                planningData, 
                language
            );

            // 3. Save AI response to Supabase
            const aiSavedMsg = await chatSessionService.saveMessage({
                session_id: activeSessionId,
                role: 'assistant',
                content: aiResponse,
                metadata: { status: 'sent' }
            });

            // Add AI response to the UI
            setMessages(prev => [...prev, {
                id: aiSavedMsg.id,
                role: 'assistant',
                content: aiResponse,
                status: 'sent'
            }]);
        } catch (err) {
            console.error('[AiChatDrawer] AI response generation failed:', err);
            // Insert local UI warning about failure
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: language === 'tr' 
                    ? 'Yapay zekâ yanıtı oluşturulurken bir hata oluştu. Lütfen mesajınızı yeniden gönderin.' 
                    : language === 'en'
                    ? 'An error occurred while generating AI response. Please try sending your message again.'
                    : 'Ein Fehler ist beim Generieren der KI-Antwort aufgetreten. Bitte senden Sie Ihre Nachricht erneut.',
                status: 'failed'
            }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleRetry = async (failedMsg) => {
        // Remove failed message from local UI (or the local error warning)
        setMessages(prev => prev.filter(m => m.id !== failedMsg.id));
        
        // Re-send the message content
        await handleSendMessage(failedMsg.content);
    };

    const handleHandoff = () => {
        if (!activeSessionId) return;

        // Gather last user query
        const userMsgs = messages.filter(m => m.role === 'user');
        const lastQuery = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : '';

        const data = {
            name: user?.full_name || user?.email || '',
            city: planningData.city || '',
            date: planningData.weddingDate || '',
            guests: Array.isArray(planningData.guests) ? planningData.guests.length : '',
            budget: planningData.budget || '',
            category: 'All-in-one Planning Assistant',
            lastQuery
        };

        const supportNumber = '+4917684337222'; // Default WhatsApp support number
        const link = handoffService.getLink(HANDOFF_CHANNELS.WHATSAPP, supportNumber, data, language);
        window.open(link, '_blank');
    };

    // Render nothing if feature flag is disabled
    if (!isEnabled) return null;

    return (
        <div className="ai-chat-drawer-container">
            {/* 1. Floating Bubble Trigger */}
            {!isOpen && (
                <button 
                    className="ai-chat-trigger-bubble" 
                    onClick={() => setIsOpen(true)}
                    title={t('aiChat.triggerTooltip') || 'Wedding Assistant'}
                >
                    <MessageSquare size={26} className="text-white" />
                    <span className="ai-chat-pulse"></span>
                </button>
            )}

            {/* 2. Side Drawer Chat Panel */}
            {isOpen && (
                <div className="ai-chat-drawer-panel" data-aos="slide-left">
                    {/* Drawer Header */}
                    <div className="ai-chat-drawer-header">
                        <div className="flex items-center gap-2">
                            <div className="ai-chat-avatar-icon">🤖</div>
                            <div>
                                <h3>{t('aiChat.title') || 'KI-Hochzeitsplaner'}</h3>
                                <span className="ai-chat-status-text">online</span>
                            </div>
                        </div>
                        <button className="ai-chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Guest (Unauthenticated) Warm Welcoming View */}
                    {!user ? (
                        <div className="ai-chat-guest-view">
                            <div className="ai-chat-guest-illustration">💖</div>
                            <h4>{t('aiChat.guestWelcomeTitle') || 'Meet Your AI Wedding Planner!'}</h4>
                            <p>{t('aiChat.guestWelcomeDesc')}</p>
                            
                            <div className="ai-chat-guest-features">
                                <div className="guest-feature-card">
                                    <span className="guest-feature-icon">💰</span>
                                    <span>{language === 'tr' ? 'Bütçe Planlayıcı' : language === 'en' ? 'Budget Planner' : 'Budgetplaner'}</span>
                                </div>
                                <div className="guest-feature-card">
                                    <span className="guest-feature-icon">👥</span>
                                    <span>{language === 'tr' ? 'Davetli Yönetimi' : language === 'en' ? 'Guest Manager' : 'Gästeliste'}</span>
                                </div>
                                <div className="guest-feature-card">
                                    <span className="guest-feature-icon">📋</span>
                                    <span>{language === 'tr' ? 'Yapılacaklar Listesi' : language === 'en' ? 'Checklist' : 'Checkliste'}</span>
                                </div>
                            </div>

                            <div className="ai-chat-guest-actions">
                                <button className="btn-guest-login" onClick={() => { setIsOpen(false); navigate('/login'); }}>
                                    <LogIn size={16} />
                                    <span>{t('aiChat.loginBtn') || 'Log In'}</span>
                                </button>
                                <button className="btn-guest-register" onClick={() => { setIsOpen(false); navigate('/register'); }}>
                                    <UserPlus size={16} />
                                    <span>{t('aiChat.registerBtn') || 'Register'}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Authenticated User Chat View */
                        <div className="ai-chat-user-view">
                            {/* Conversations Sidebar/Top Toggle */}
                            <div className="ai-chat-sessions-header">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {language === 'tr' ? 'Sohbet Geçmişi' : language === 'en' ? 'Chat History' : 'Verlauf'}
                                </span>
                                <button className="btn-new-session" onClick={handleCreateSession} title={t('aiChat.newChat')}>
                                    <Plus size={14} />
                                    <span>{t('aiChat.newChat') || 'New'}</span>
                                </button>
                            </div>

                            {sessions.length > 1 && (
                                <div className="ai-chat-sessions-tabs">
                                    {sessions.map(s => (
                                        <div 
                                            key={s.id} 
                                            className={`session-tab-item ${activeSessionId === s.id ? 'active' : ''}`}
                                            onClick={() => { setActiveSessionId(s.id); loadMessages(s.id); }}
                                        >
                                            <span className="session-tab-title">{s.title}</span>
                                            <button className="session-tab-delete" onClick={(e) => handleDeleteSession(s.id, e)}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Message Stream */}
                            <div className="ai-chat-message-stream">
                                {messages.length === 0 && !isSessionsLoading && (
                                    <div className="ai-chat-empty-state">
                                        <p>{t('aiChat.noSessions') || 'Sohbet bulunmuyor.'}</p>
                                    </div>
                                )}

                                {messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`message-bubble-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}
                                    >
                                        <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                                            <p className="message-content">{msg.content}</p>
                                            
                                            {/* Status indicators */}
                                            {msg.role === 'user' && msg.status === 'sending' && (
                                                <span className="message-status-indicator text-gray-400 text-xs">
                                                    {t('aiChat.sending') || 'Sending...'}
                                                </span>
                                            )}
                                            {msg.role === 'user' && msg.status === 'failed' && (
                                                <div className="message-status-failed">
                                                    <AlertCircle size={12} className="text-red-500" />
                                                    <button onClick={() => handleRetry(msg)} className="btn-retry-msg">
                                                        <RefreshCw size={10} />
                                                        <span>{t('aiChat.retryBtn') || 'Dene'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isAiTyping && (
                                    <div className="message-bubble-wrapper assistant-wrapper">
                                        <div className="message-bubble assistant-bubble ai-typing-bubble">
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                            <span className="typing-text">{t('aiChat.aiTyping')}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messageEndRef} />
                            </div>

                            {/* Footer Input & Actions */}
                            <div className="ai-chat-drawer-footer">
                                <div className="ai-chat-input-wrapper">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(inputText);
                                            }
                                        }}
                                        placeholder={t('aiChat.placeholder') || 'Schreiben Sie...'}
                                        rows={1}
                                    />
                                    <button 
                                        onClick={() => handleSendMessage(inputText)}
                                        disabled={!inputText.trim() || isAiTyping}
                                        className="btn-send-message"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>

                                <div className="ai-chat-footer-actions">
                                    {/* Handoff to Whatsapp */}
                                    <button 
                                        onClick={handleHandoff}
                                        className="btn-handoff" 
                                        title={t('aiChat.handoffTooltip')}
                                    >
                                        <Phone size={14} />
                                        <span>{t('aiChat.handoffTooltip') || 'Live Desteğe Bağlan'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
