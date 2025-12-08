'use client';

import React, { useState } from 'react';

interface JsonEditorProps {
    data: any;
    onChange: (newData: any) => void;
    onDelete?: () => void;
    label?: string;
    level?: number;
    isRoot?: boolean;
}

export default function JsonEditor({ data, onChange, onDelete, label, level = 0, isRoot = false }: JsonEditorProps) {
    const [isCollapsed, setIsCollapsed] = useState(level > 1); // Auto-collapse deeper levels

    const handleFieldChange = (key: string | number, value: any) => {
        if (Array.isArray(data)) {
            const newData = [...data];
            newData[key as number] = value;
            onChange(newData);
        } else {
            const newData = { ...data, [key]: value };
            onChange(newData);
        }
    };

    const handleAddArrayItem = () => {
        if (!Array.isArray(data)) return;

        // Try to infer the shape of new items based on the first item
        let newItem: any = "";
        if (data.length > 0) {
            const template = data[0];
            if (typeof template === 'object' && template !== null) {
                // Deep clone the structure but empty the values
                newItem = JSON.parse(JSON.stringify(template));
                const clearValues = (obj: any) => {
                    for (const key in obj) {
                        if (typeof obj[key] === 'string') obj[key] = "";
                        else if (typeof obj[key] === 'number') obj[key] = 0;
                        else if (typeof obj[key] === 'boolean') obj[key] = false;
                        else if (Array.isArray(obj[key])) obj[key] = [];
                        else if (typeof obj[key] === 'object') clearValues(obj[key]);
                    }
                };
                clearValues(newItem);
            } else if (typeof template === 'number') {
                newItem = 0;
            } else if (typeof template === 'boolean') {
                newItem = false;
            }
        } else {
            // Default to object if array is empty, UNLESS label implies string array
            const stringArrayLabels = ['top_universities', 'required_exams', 'required_employment_status', 'remove'];
            if (label && stringArrayLabels.includes(label)) {
                newItem = "";
            } else {
                newItem = {};
            }
        }

        onChange([...data, newItem]);
    };

    const handleRemoveArrayItem = (index: number) => {
        if (!Array.isArray(data)) return;
        const newData = data.filter((_, i) => i !== index);
        onChange(newData);
    };

    // --- Render Helpers ---

    const renderLabel = () => {
        if (!label) return null;
        return (
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 capitalize">
                    {label.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                    {(typeof data === 'object' && data !== null) && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none px-2 py-1 rounded hover:bg-blue-50"
                        >
                            {isCollapsed ? 'Expand' : 'Collapse'}
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-xs text-red-500 hover:text-red-700 focus:outline-none px-2 py-1 rounded hover:bg-red-50 font-medium"
                            title="Remove Item"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // 1. Array Renderer
    if (Array.isArray(data)) {
        return (
            <div className={`mb-4 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
                {renderLabel()}
                {!isCollapsed && (
                    <div className="space-y-4">
                        {data.map((item, index) => (
                            <div key={index} className="relative group bg-gray-50 p-3 rounded-md border border-gray-200">
                                <JsonEditor
                                    data={item}
                                    onChange={(val) => handleFieldChange(index, val)}
                                    onDelete={() => handleRemoveArrayItem(index)}
                                    label={
                                        (typeof item === 'object' && item !== null)
                                            ? (item.id || item.step_id || item.name || item.title || `Item ${index + 1}`)
                                            : `Item ${index + 1}`
                                    }
                                    level={level + 1}
                                />
                            </div>
                        ))}
                        <button
                            onClick={handleAddArrayItem}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors text-sm font-medium"
                        >
                            + Add Item
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // 2. Object Renderer
    if (typeof data === 'object') {
        if (data === null) {
            const handleInit = () => {
                if (label === 'eligibility') {
                    onChange({
                        min_annual_income: 0,
                        min_liquid_savings: 0,
                        required_education: 'high_school',
                        required_employment_status: [],
                        max_age: 0
                    });
                } else if (label === 'university_guide') {
                    onChange({
                        top_universities: [],
                        application_platforms: [],
                        intake_seasons: [],
                        required_exams: [],
                        pre_visa_steps: []
                    });
                } else {
                    onChange({});
                }
            };

            return (
                <div className={`mb-4 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
                    {renderLabel()}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 italic text-sm">null</span>
                        <button
                            onClick={handleInit}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200"
                        >
                            {label === 'eligibility' ? 'Init Eligibility Schema' :
                                label === 'university_guide' ? 'Init University Guide' : 'Init Object'}
                        </button>
                        <button
                            onClick={() => onChange("")}
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 border border-gray-200"
                        >
                            Init String
                        </button>
                    </div>
                </div>
            );
        }

        const handleAddMissingKey = (key: string, template: any) => {
            onChange({ ...data, [key]: template });
        };

        return (
            <div className={`mb-4 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
                {renderLabel()}
                {!isCollapsed && (
                    <div className="space-y-3">
                        {Object.keys(data).map((key) => (
                            <JsonEditor
                                key={key}
                                data={data[key]}
                                onChange={(val) => handleFieldChange(key, val)}
                                label={key}
                                level={level + 1}
                            />
                        ))}

                        {Object.keys(data).length === 0 && (
                            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded border border-gray-200 border-dashed">
                                <span className="text-xs text-gray-500 italic">Empty Object</span>
                                <button
                                    onClick={() => onChange("")}
                                    className="text-xs bg-white text-gray-600 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                                >
                                    Convert to String
                                </button>
                            </div>
                        )}

                        {isRoot && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                {!data.eligibility && (
                                    <button
                                        onClick={() => handleAddMissingKey('eligibility', null)}
                                        className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded hover:bg-green-100 border border-green-200 font-medium"
                                    >
                                        + Add Eligibility
                                    </button>
                                )}
                                {!data.university_guide && (
                                    <button
                                        onClick={() => handleAddMissingKey('university_guide', null)}
                                        className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded hover:bg-purple-100 border border-purple-200 font-medium"
                                    >
                                        + Add University Guide
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // 3. Primitive Renderers
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                {label && (
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {label.replace(/_/g, ' ')}
                    </label>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="text-xs text-red-400 hover:text-red-600"
                        title="Remove Field"
                    >
                        ✕
                    </button>
                )}
            </div>

            {typeof data === 'boolean' ? (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onChange(!data)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${data ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className="text-sm text-gray-900 font-medium">{data ? 'True' : 'False'}</span>
                </div>
            ) : typeof data === 'number' ? (
                <input
                    type="number"
                    value={data}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                />
            ) : (
                // String handling - check for long text
                (data.length > 60 || label?.includes('description') || label?.includes('content')) ? (
                    <textarea
                        value={data}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                    />
                ) : (
                    <input
                        type="text"
                        value={data}
                        onChange={(e) => onChange(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                    />
                )
            )}
        </div>
    );
}
