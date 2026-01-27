import React from 'react';
import './SuspenseSkeleton.css';

/**
 * Skeleton loading placeholder for Suspense fallback
 * Prevents CLS by reserving space while components load
 */
const SuspenseSkeleton = () => {
    return (
        <div className="suspense-skeleton">
            {/* Section placeholder */}
            <div className="skeleton-section">
                <div className="skeleton-title"></div>
                <div className="skeleton-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line short"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuspenseSkeleton;
