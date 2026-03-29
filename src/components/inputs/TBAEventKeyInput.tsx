import { inputSelector, updateValue, useQRScoutState } from "@/store/store";
import { ConfigurableInputProps } from "./ConfigurableInput";
import { TBAEventKeyInputData } from "./BaseInputProps";
import { Textarea } from "../ui/textarea";
import { useEvent } from "@/hooks";
import { useMemo } from "react";

export default function TBAEventKeyInput(props: ConfigurableInputProps) {
    const data = useQRScoutState(
        inputSelector<TBAEventKeyInputData>(props.section, props.code),
    );

    const matchData = useQRScoutState(state => state.matchData);

    if (!data) {
        return <div>Invalid input</div>;
    }

    if (!matchData || matchData?.length < 0) {
        return <div>No match data</div>;
    }

    const key = matchData[0].event_key;

    useMemo(() => updateValue(props.code, key), []);

    useEvent('resetFields', () => updateValue(props.code, key));

    return (
        <Textarea
            disabled={true}
            name={`${data.title}_display`}
            id={`${data.title}_display`}
            value={key}
        >key</Textarea>
    )
}