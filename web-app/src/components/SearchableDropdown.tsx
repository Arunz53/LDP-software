import React, { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
    options: Array<{ id: number; label: string }>;
    value: number | undefined;
    onChange: (id: number) => void;
    placeholder?: string;
    label?: string;
    fontSize?: number;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    fontSize = 14,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);
    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: number) => {
        onChange(id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize }}>{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '10px 12px',
                    border: '1px solid #d6e1f5',
                    borderRadius: 10,
                    background: '#f8fbff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span style={{ color: selectedOption ? '#0f172a' : '#94a3b8', fontSize }}>
                    {selectedOption?.label || placeholder}
                </span>
                <span style={{ fontSize: 12 }}>▼</span>
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        background: 'white',
                        border: '1px solid #d6e1f5',
                        borderRadius: 10,
                        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                        zIndex: 1000,
                        maxHeight: 250,
                        overflowY: 'auto',
                    }}
                >
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            borderBottom: '1px solid #d6e1f5',
                            borderRadius: '10px 10px 0 0',
                            outline: 'none',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                        {filteredOptions.length === 0 ? (
                            <div style={{ padding: '12px 16px', color: '#94a3b8', textAlign: 'center' }}>
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        background: value === option.id ? '#eff6ff' : 'transparent',
                                        color: value === option.id ? '#1d4ed8' : '#0f172a',
                                        fontWeight: value === option.id ? 600 : 400,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== option.id) {
                                            e.currentTarget.style.background = '#f8fbff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (value !== option.id) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
