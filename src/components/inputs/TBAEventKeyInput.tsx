import { inputSelector, updateValue, useQRScoutState } from "@/store/store";
import { ConfigurableInputProps } from "./ConfigurableInput";
import { TBAEventKeyInputData } from "./BaseInputProps";
import { Textarea } from "../ui/textarea";
import { useEvent } from "@/hooks";
import React, { useEffect, useMemo } from "react";
import { Input } from "../ui/input";

export default function TBAEventKeyInput(props: ConfigurableInputProps) {
    const data = useQRScoutState(
        inputSelector<TBAEventKeyInputData>(props.section, props.code),
    );

    const matchData = useQRScoutState(state => state.matchData);

    const [value, setValue] = React.useState<string>(!matchData ? "" : matchData[0].event_key);

    useMemo(() => updateValue(props.code, value), []);

    useEffect(() => {
        if (data && matchData && matchData.length > 0) {
            setValue(matchData[0].event_key);
        }
    }, [matchData])

    useEvent('resetFields', () => setValue(!matchData ? value : matchData[0].event_key));

    useEffect(() => {
        updateValue(props.code, value);
    }, [value, props.code]);

    if (!data || !matchData || matchData?.length < 0) {
        return (
    <Input
      type="text"
      value={value || ''}
      id={data?.title}
      onChange={e => {
        console.log(e.target.value);
        setValue(e.target.value);
      }}
      placeholder="Enter event key"
    />
  );
    }

    return (
        <Textarea
            disabled={true}
            name={`${data.title}_display`}
            id={`${data.title}_display`}
            value={value}
        >key</Textarea>
    )
}