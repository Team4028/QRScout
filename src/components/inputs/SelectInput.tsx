import { useEvent } from '@/hooks';
import { inputSelector, updateValue, useQRScoutState } from '@/store/store';
import { useCallback, useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { SelectInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';

export default function SelectInput(props: ConfigurableInputProps) {
    const data = useQRScoutState(
        inputSelector<SelectInputData>(props.section, props.code),
    );

    if (!data) {
        return <div>Invalid input</div>;
    }

    const [value, setValue] = useState(data.defaultValue);

    useEffect(() => {
        updateValue(props.code, value);
    }, [value]);

    const resetState = useCallback(
        ({ force }: { force: boolean }) => {
            console.log(
                `resetState ${data.code}`,
                `force: ${force}`,
                `behavior: ${data.formResetBehavior}`,
            );
            if (force) {
                setValue(data.defaultValue);
                return;
            }
            if (data.formResetBehavior === 'preserve') {
                return;
            }
            if (props.code === "allianceColor")
                window.dispatchEvent(new CustomEvent('allianceColorUpdate', { detail: { color: data.defaultValue } }))
            setValue(data.defaultValue);
        },
        [data.defaultValue],
    );

    useEvent('resetFields', resetState);

    const handleSelect = useCallback((value: string) => {
        setValue(value);
        if (props.code === "allianceColor")
            window.dispatchEvent(new CustomEvent('allianceColorUpdate', { detail: { color: value } }))
    }, []);

    if (!data || !data?.choices) {
        return <div>Invalid input</div>;
    }
    return (
        <Select name={data.title} onValueChange={handleSelect} value={value}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {Object.keys(data.choices).map(o => {
                    return (
                        <SelectItem key={o} value={o}>
                            {data.choices?.[o]}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
