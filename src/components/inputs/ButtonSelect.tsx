import { useEvent } from "@/hooks";
import { inputSelector, updateValue, useQRScoutState } from "@/store/store";
import { useCallback, useEffect, useState } from "react";

import { ButtonSelectInputData } from "./BaseInputProps";
import { ConfigurableInputProps } from "./ConfigurableInput";
import { Button } from "../ui/button";

export default function ButtonSelectInput(props: ConfigurableInputProps) {
    const data = useQRScoutState(
        inputSelector<ButtonSelectInputData>(props.section, props.code)
    );

    if (!data) {
        return <div>Invalid input</div>;
    }

    const [value, setValue] = useState(data.defaultValue);

    useEffect(() => {
        updateValue(props.code, value);
    }, [value]);

    const resetState = useCallback(
        ({ force }: {force: boolean}) => {
            console.log(
                `resetState ${data.code}`,
                `force: ${force}`,
                `behavior: ${data.formResetBehavior}`,
            );
            if (force) {
                setValue(data.defaultValue);
                return;
            }
            if (data.formResetBehavior === 'preserve')
                return;
            setValue(data.defaultValue);
        },
        [data.defaultValue]
    );

    useEvent('resetFields', resetState);

    const handleSelect = useCallback((value: string) => {
        setValue(value);
    }, []);

    if (!data || !data?.choices)
        return <div>Invalid input</div>;

    return (
        <div className="my-2 flex flex-row items-center justify-center gap-3">
            {Object.keys(data.choices).map(o => {
                return (
                    <Button variant={value === o ? "default" : "outline"} key={o} onClick={() => handleSelect(o)}>
                        {data.choices?.[o]}
                    </Button>
                )
            })}
        </div>
    )
}