import { useEvent } from '@/hooks';
import { inputSelector, updateValue, useQRScoutState } from '@/store/store';
import React, { useCallback, useEffect } from 'react';
import { Input } from '../ui/input';
import { NumberInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';

export default function NumberInput(props: ConfigurableInputProps) {
    const data = useQRScoutState(
        inputSelector<NumberInputData>(props.section, props.code),
    );

    if (!data) {
        return <div>Invalid input</div>;
    }

    const [value, setValue] = React.useState<number | ''>(data.defaultValue);
    const [matchNumber, setMatchNumber] = React.useState<number | ''>(1);
    const [allianceColor, setAllianceColor] = React.useState<string | ''>("R");

    useEffect(() => {
        if (props.code === "matchNumber" && matchNumber !== null && allianceColor !== null) {
            fetch('./teams.json')
                .then(res => res.json())
                .then(json => {
                    const teamJson = json.matches?.[matchNumber]?.[allianceColor == "R" ? "red" : "blue"];
                    window.dispatchEvent(new CustomEvent("allianceTeamLoad",{ detail: {
                        t1: teamJson["1"],
                        t2: teamJson["2"],
                        t3: teamJson["3"]
                    }}));
                })
                .catch(error => console.log(`Error loading team data: ${error}`));
        }
    }, [props.code, matchNumber, allianceColor]);

    useEffect(() => {
        const handleMatchNumUpdate = (event: CustomEvent<{match: number}>) => {
            console.log(`Match updated to ${event.detail.match}`);
            setMatchNumber(event.detail.match);
        };

        const handleAllianceColorUpdate = (event: CustomEvent<{color: string}>) => {
            console.log(`Color updated to ${event.detail.color}`);
            setAllianceColor(event.detail.color);
        };

        window.addEventListener('matchNumUpdate', handleMatchNumUpdate as EventListener);
        window.addEventListener('allianceColorUpdate', handleAllianceColorUpdate as EventListener);
    }, []);

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

            switch (data.formResetBehavior) {
                case 'reset':
                    setValue(data.defaultValue);
                    if (props.code === "matchNumber") {
                      window.dispatchEvent(new CustomEvent('matchNumUpdate', { detail: { match: data.defaultValue } }))
                    }
                    return;
                case 'increment':
                    setValue(prev => (typeof prev === 'number' ? prev + 1 : 1));
                    if (props.code === "matchNumber") {
                      window.dispatchEvent(new CustomEvent('matchNumUpdate', { detail: { match: Number(value) + 1 } }))
                    }
                    return;
                case 'preserve':
                    return;
                default:
                    return;
            }
        },
        [data.defaultValue, value],
    );

    useEvent('resetFields', resetState);

    useEffect(() => {
        updateValue(props.code, value);
    }, [value]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const parsed = Number(e.currentTarget.value);
            if (e.currentTarget.value === '') {
                setValue('');
                return;
            }
            if (isNaN(parsed)) {
                return;
            }
            if (data?.min && parsed < data.min) {
                return;
            }
            if (data?.max && parsed > data.max) {
                return;
            }
            setValue(parsed);
            if (props.code === "matchNumber") {
              window.dispatchEvent(new CustomEvent('matchNumUpdate', { detail: { match: parsed } }))
            }
            e.preventDefault();
        },
        [data],
    );

    return (
        <Input
            type="number"
            value={value}
            id={data.title}
            min={data.min}
            max={data.max}
            onChange={handleChange}
        />
    );
}
