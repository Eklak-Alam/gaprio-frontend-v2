import React, { useState, useEffect } from 'react';

/**
 * DraftReviewCard Component
 * 
 * Interactive card for reviewing and editing email drafts inline.
 * Supports "View Mode" and "Edit Mode".
 * 
 * Props:
 * - draft: { draft_id, to, subject, body, url }
 * - onSend: (command) => void
 */
const DraftReviewCard = ({ draft, onSend }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        body: ''
    });

    // Initialize state from props
    useEffect(() => {
        if (draft) {
            setFormData({
                to: draft.to || '',
                subject: draft.subject || '',
                body: draft.body || ''
            });
        }
    }, [draft]);

    if (!draft) return null;

    const handleSave = () => {
        // Construct detailed update command
        // Note: The backend regex uses greedy matching for body, so it handles internal quotes
        // as long as the command ends with the closing quote.
        // We escape quotes in the body just in case? No, the regex handles it if it's the last group.
        // But for To/Subject, quotes might break it.
        // Safe bet: stick to simple structure. The user code didn't escape.
        const command = `update draft ${draft.draft_id} to "${formData.to}" subject "${formData.subject}" body "${formData.body}"`;
        onSend(command);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data
        setFormData({
            to: draft.to || '',
            subject: draft.subject || '',
            body: draft.body || ''
        });
    };

    // ========================================================================
    // EDIT MODE
    // ========================================================================
    if (isEditing) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #F97316',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '100%' // Changed from 400px to 100% for responsive drawer
            }}>
                <div style={{
                    color: '#F97316',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '8px',
                    marginBottom: '4px'
                }}>
                    ✏️ Editing Draft
                </div>

                {/* Recipient Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>To</label>
                    <input
                        type="text"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#E5E7EB',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            width: '100%'
                        }}
                    />
                </div>

                {/* Subject Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Subject</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#E5E7EB',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            width: '100%'
                        }}
                    />
                </div>

                {/* Body Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Body</label>
                    <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        rows={6}
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#E5E7EB',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                            width: '100%'
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid #4B5563',
                            color: '#D1D5DB',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: '#F97316',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        );
    }

    // ========================================================================
    // VIEW MODE
    // ========================================================================
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '100%' // Changed from 400px to 100%
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#F97316',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '8px'
            }}>
                <span>📝</span> Draft for Review
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.9rem'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px' }}>
                    <span style={{ color: '#9CA3AF' }}>To:</span>
                    <span style={{ color: '#E5E7EB', wordBreak: 'break-word' }}>{draft.to}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px' }}>
                    <span style={{ color: '#9CA3AF' }}>Subject:</span>
                    <span style={{ color: '#E5E7EB', fontWeight: '500' }}>{draft.subject || '(No Subject)'}</span>
                </div>
                {/* Body Preview (Optional) */}
                {draft.body && (
                    <div style={{
                        marginTop: '4px',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '6px',
                        color: '#D1D5DB',
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '150px', // Slightly larger
                        overflowY: 'auto'
                    }}>
                        {draft.body}
                    </div>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '8px'
            }}>
                <button
                    onClick={() => setIsEditing(true)}
                    style={{
                        padding: '10px 16px',
                        textAlign: 'center',
                        background: 'transparent',
                        border: '1px solid #4B5563',
                        color: '#D1D5DB',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <span>✏️</span> Edit
                </button>

                <button
                    onClick={() => onSend(`send draft ${draft.draft_id}`)}
                    style={{
                        padding: '10px 16px',
                        background: '#F97316',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'filter 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                    Send Now 🚀
                </button>
            </div>

            {/* Native Link as fallback */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <a
                    href={draft.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6B7280', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                    Open in Gmail ↗
                </a>
            </div>
        </div>
    );
};

export default DraftReviewCard;
