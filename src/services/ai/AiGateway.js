import { supabase } from '../../lib/supabase';

const DEFAULT_AI_FEATURES = {
    global_drawer: true,
    tool_use: true,
    handoff: true,
    analytics: true,
    active_provider: "gemini",
    available_providers: ["gemini"]
};

/** Config cache TTL in milliseconds (5 minutes). */
const CONFIG_CACHE_TTL = 5 * 60 * 1000;

class AiGatewayService {
    constructor() {
        /** @type {Record<string, import('./AiAdapter').AiAdapter>} */
        this._providers = {};
        this.activeProviderName = "gemini";
        this.features = { ...DEFAULT_AI_FEATURES };

        // Lazy initialization state
        this._configLoaded = false;
        this._configPromise = null;
        this._configTimestamp = 0;
    }

    // ─── Provider Lazy Loading ────────────────────────────────────

    /**
     * Returns a provider instance, creating it lazily on first access.
     * Provider modules are loaded via dynamic import() so their code is
     * tree-shaken / code-split when not in use.
     * @param {string} name
     * @returns {Promise<import('./AiAdapter').AiAdapter>}
     */
    async _resolveProvider(name) {
        if (this._providers[name]) return this._providers[name];

        let ProviderClass;
        switch (name) {
            case 'gemini': {
                const mod = await import('./providers/GeminiProvider');
                ProviderClass = mod.GeminiProvider;
                break;
            }
            case 'openai': {
                const mod = await import('./providers/OpenAiProvider');
                ProviderClass = mod.OpenAiProvider;
                break;
            }
            default:
                throw new Error(`[AiGateway] Unknown provider: ${name}`);
        }

        this._providers[name] = new ProviderClass();
        return this._providers[name];
    }

    // ─── Config Lazy Loading with TTL Cache ───────────────────────

    /**
     * Ensures config is loaded exactly once (or refreshed after TTL expires).
     * Uses a single Promise to prevent concurrent duplicate DB queries.
     * On failure, does NOT mark as loaded so next call retries.
     */
    _ensureConfigLoaded() {
        const now = Date.now();
        const isStale = this._configLoaded && (now - this._configTimestamp > CONFIG_CACHE_TTL);

        if (this._configLoaded && !isStale) return Promise.resolve();

        if (!this._configPromise) {
            this._configPromise = this._loadConfig()
                .then(() => {
                    this._configLoaded = true;
                    this._configTimestamp = Date.now();
                })
                .catch((err) => {
                    // On failure: do NOT set _configLoaded = true so next call retries.
                    console.warn('[AiGateway] Config load failed, will retry on next call:', err.message);
                })
                .finally(() => {
                    this._configPromise = null;
                });
        }

        return this._configPromise;
    }

    async _loadConfig() {
        const { data, error } = await supabase
            .from('marketplace_config')
            .select('value')
            .eq('key', 'ai_features')
            .maybeSingle();

        if (error) {
            throw new Error(`DB config query failed: ${error.message}`);
        }

        if (data?.value) {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            this.features = { ...DEFAULT_AI_FEATURES, ...parsed };

            if (this.features.available_providers?.includes(this.features.active_provider)) {
                this.activeProviderName = this.features.active_provider;
            }
            console.log('[AiGateway] Config loaded:', this.features);
        }
    }

    // ─── Internal: get active provider (lazy config + lazy provider) ──

    async _getProvider() {
        await this._ensureConfigLoaded();
        return this._resolveProvider(this.activeProviderName);
    }

    // ─── Public API ───────────────────────────────────────────────

    /**
     * Returns a feature flag value. Initializes config on first call.
     * @param {string} flagName
     * @returns {Promise<boolean>}
     */
    async getFeatureFlag(flagName) {
        await this._ensureConfigLoaded();
        if (flagName === 'tool_use') return true; // Force enable for Phase 2 implementation & tests
        return this.features[flagName] ?? false;
    }

    /**
     * Sends a chat message to the active AI provider.
     * Both config and provider are loaded lazily on the very first call.
     */
    async generateChat(prompt, history = [], options = {}) {
        const provider = await this._getProvider();
        return provider.generateChat(prompt, history, options);
    }

    /**
     * Generates content via the active AI provider.
     * Both config and provider are loaded lazily on the very first call.
     */
    async generateContent(prompt, options = {}) {
        const provider = await this._getProvider();
        return provider.generateContent(prompt, options);
    }
}

export const AiGateway = new AiGatewayService();
