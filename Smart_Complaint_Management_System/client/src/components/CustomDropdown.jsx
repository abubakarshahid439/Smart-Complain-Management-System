import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, Filter, Star, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

// Animation Variants
const dropdownVariants = {
    hidden: { 
        opacity: 0, 
        y: -8, 
        scale: 0.95,
        transition: { duration: 0.15, ease: 'easeOut' }
    },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
            staggerChildren: 0.03
        }
    },
    exit: { 
        opacity: 0, 
        y: -8, 
        scale: 0.95,
        transition: { duration: 0.12, ease: 'easeIn' }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.15, ease: 'easeOut' }
    }
};

const CustomDropdown = ({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    className,
    labelClassName,
    showSearch = false,
    showIcons = false,
    size = 'default', // 'sm', 'default', 'lg'
    variant = 'default', // 'default', 'outline', 'filled'
    error = false,
    success = false,
    disabled = false,
    helperText = '',
    label = '',
    required = false,
    icon: IconComponent,
    clearable = false,
    onClear,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && showSearch && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current.focus();
            }, 100);
        }
    }, [isOpen, showSearch]);

    const filteredOptions = showSearch && searchTerm
        ? options.filter(opt => {
            const label = typeof opt === 'string' ? opt : opt.label;
            return label.toLowerCase().includes(searchTerm.toLowerCase());
        })
        : options;

    const selectedOption = options.find(opt =>
        (typeof opt === 'string' ? opt : opt.value) === value
    );

    const getLabel = (opt) => typeof opt === 'string' ? opt : opt.label;
    const getValue = (opt) => typeof opt === 'string' ? opt : opt.value;
    const getIcon = (opt) => typeof opt === 'string' ? null : opt.icon;

    const handleSelect = (optValue) => {
        onChange(optValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        if (onClear) onClear();
        setSearchTerm('');
    };

    // Size configurations
    const sizeConfigs = {
        sm: {
            button: 'px-3 py-1.5 text-xs rounded-lg',
            dropdown: 'p-1.5',
            option: 'px-3 py-1.5 text-xs rounded-lg',
            icon: 'w-3.5 h-3.5'
        },
        default: {
            button: 'px-4 py-2.5 text-sm rounded-xl',
            dropdown: 'p-2',
            option: 'px-4 py-2.5 text-xs rounded-xl',
            icon: 'w-4 h-4'
        },
        lg: {
            button: 'px-5 py-3 text-base rounded-2xl',
            dropdown: 'p-2.5',
            option: 'px-4 py-3 text-sm rounded-xl',
            icon: 'w-5 h-5'
        }
    };

    const sizeConfig = sizeConfigs[size] || sizeConfigs.default;

    // Variant configurations
    const variantConfigs = {
        default: {
            button: `bg-white border-slate-200 hover:border-slate-300 focus:border-indigo-500 
                     shadow-sm hover:shadow ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`,
            dropdown: 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
        },
        outline: {
            button: `bg-transparent border-2 border-slate-200 hover:border-slate-300 focus:border-indigo-500
                     ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`,
            dropdown: 'bg-white border-2 border-slate-200 shadow-xl shadow-slate-200/50',
        },
        filled: {
            button: `bg-slate-50 border-slate-200 hover:bg-slate-100 focus:border-indigo-500
                     ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`,
            dropdown: 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
        }
    };

    const variantConfig = variantConfigs[variant] || variantConfigs.default;

    // Status configurations
    const getStatusStyles = () => {
        if (error) {
            return {
                button: 'border-rose-300 focus:border-rose-500 ring-4 ring-rose-50',
                text: 'text-rose-600',
                icon: 'text-rose-500'
            };
        }
        if (success) {
            return {
                button: 'border-emerald-300 focus:border-emerald-500 ring-4 ring-emerald-50',
                text: 'text-emerald-600',
                icon: 'text-emerald-500'
            };
        }
        return {
            button: isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : '',
            text: 'text-slate-900',
            icon: 'text-slate-400'
        };
    };

    const statusStyles = getStatusStyles();

    return (
        <div className={clsx("relative w-full", className)} ref={dropdownRef}>
            {/* Label */}
            {label && (
                <label className={clsx(
                    "block text-xs font-bold text-slate-700 mb-1.5 tracking-wide",
                    error ? "text-rose-600" : "",
                    success ? "text-emerald-600" : "",
                    labelClassName
                )}>
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={(e) => {
                    if (disabled) return;
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                    setSearchTerm('');
                }}
                disabled={disabled}
                className={clsx(
                    "w-full flex items-center gap-2 transition-all duration-200 relative",
                    "font-medium text-left",
                    sizeConfig.button,
                    variantConfig.button,
                    statusStyles.button,
                    disabled && "cursor-not-allowed opacity-60",
                    !disabled && "hover:shadow-md active:scale-[0.99]",
                )}
            >
                {/* Icon */}
                {IconComponent && (
                    <IconComponent className={clsx(
                        "flex-shrink-0",
                        sizeConfig.icon,
                        statusStyles.icon
                    )} />
                )}

                {/* Selected Value */}
                <span className={clsx(
                    "flex-1 truncate",
                    selectedOption ? statusStyles.text : "text-slate-400"
                )}>
                    {selectedOption ? getLabel(selectedOption) : placeholder}
                </span>

                {/* Clear Button */}
                {clearable && selectedOption && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={handleClear}
                        className="p-0.5 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                        type="button"
                    >
                        <X size={14} className="text-slate-400 hover:text-slate-600" />
                    </motion.button>
                )}

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex-shrink-0"
                >
                    <ChevronDown
                        size={size === 'sm' ? 14 : 16}
                        className={clsx(
                            "transition-colors",
                            isOpen ? "text-indigo-600" : "text-slate-400",
                            !disabled && "group-hover:text-indigo-500"
                        )}
                    />
                </motion.div>
            </button>

            {/* Helper Text */}
            {helperText && (
                <p className={clsx(
                    "mt-1 text-xs font-medium",
                    error ? "text-rose-500" : success ? "text-emerald-500" : "text-slate-400"
                )}>
                    {helperText}
                </p>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={clsx(
                            "absolute z-[100] w-full mt-1.5 overflow-hidden",
                            "rounded-xl",
                            variantConfig.dropdown,
                            sizeConfig.dropdown
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        {showSearch && (
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search options..."
                                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        {/* Options List */}
                        <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                            {filteredOptions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <Filter size={24} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No options found</span>
                                </div>
                            ) : (
                                filteredOptions.map((opt, idx) => {
                                    const optValue = getValue(opt);
                                    const optLabel = getLabel(opt);
                                    const optIcon = getIcon(opt);
                                    const isSelected = optValue === value;

                                    return (
                                        <motion.button
                                            key={idx}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(optValue);
                                            }}
                                            className={clsx(
                                                "w-full flex items-center gap-2.5 transition-all duration-150",
                                                sizeConfig.option,
                                                isSelected
                                                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                            )}
                                        >
                                            {/* Option Icon */}
                                            {showIcons && (optIcon || IconComponent) && (
                                                <div className={clsx(
                                                    "flex-shrink-0",
                                                    isSelected ? "text-indigo-500" : "text-slate-400"
                                                )}>
                                                    {optIcon ? (
                                                        <optIcon className={sizeConfig.icon} />
                                                    ) : IconComponent ? (
                                                        <IconComponent className={sizeConfig.icon} />
                                                    ) : null}
                                                </div>
                                            )}

                                            <span className="flex-1 text-left truncate">
                                                {optLabel}
                                            </span>

                                            {/* Selected Indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="flex-shrink-0"
                                                >
                                                    <Check size={size === 'sm' ? 14 : 16} className="text-indigo-600" />
                                                </motion.div>
                                            )}

                                            {/* Popularity Indicator */}
                                            {opt.popular && (
                                                <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" />
                                            )}
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[9px] font-medium text-slate-400">
                                {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;