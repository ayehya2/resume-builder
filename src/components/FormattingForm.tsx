export function FormattingForm() {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-black">Resume Formatting (Coming Soon)</h3>

            <div className="space-y-4">
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h4 className="font-bold text-black mb-3">🎨 Customization Options</h4>
                    <ul className="space-y-2 text-sm text-black">
                        <li>• <strong>Font Selection</strong> - Choose from professional fonts</li>
                        <li>• <strong>Color Themes</strong> - Customize accent colors</li>
                        <li>• <strong>Spacing Controls</strong> - Adjust margins and line spacing</li>
                        <li>• <strong>Section Order</strong> - Drag to reorder (available in Sections tab)</li>
                        <li>• <strong>Bullet Styles</strong> - Change bullet point appearance</li>
                    </ul>
                </div>

                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="font-bold text-black">
                        ✅ For now, use the <strong>Template</strong> tab to choose from 4 professional designs!
                    </p>
                </div>
            </div>
        </div>
    );
}
