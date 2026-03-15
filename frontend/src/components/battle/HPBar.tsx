interface Props {
    label: string;
    current: number;
    max: number;
    color: 'green' | 'red';
}

export function HPBar({ label, current, max, color }: Props) {
    const percent = Math.max(0, (current / max) * 100);
    const barColor = color === 'green' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="w-40">
            <div className="flex justify-between text-xs text-white mb-1">
                <span>{label}</span>
                <span>{current}/{max}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}