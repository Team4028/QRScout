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
  const [matchNumber, setMatchNumber] = React.useState<number | null>(1);
  const [robotColorNum, setRobotColorNum] = React.useState<string | null>("R1");

  useEffect(() => {
    if (props.code === "teamNumber" && matchNumber !== null && robotColorNum !== null) {
      fetch('./teams.json')
        .then(response => response.json())
        .then(json => {
          const sanitizeALittleBit = robotColorNum.toLowerCase();
          const color = (sanitizeALittleBit.includes("r") ? "red" : "blue")
          const number = (sanitizeALittleBit.includes("1") ? 1 : (sanitizeALittleBit.includes("2") ? 2 : 3))
          const team = json.matches?.[matchNumber]?.[color]?.[number] || 0;
          setValue(team)
        })
        .catch(error => console.error('Error loading team data: ', error))
    }
  }, [props.code, matchNumber, robotColorNum]);

  useEffect(() => {
    const handleMatchUpdate = (event: CustomEvent<{match: number}>) => {
      console.log("match updated to " + event.detail.match);
      setMatchNumber(event.detail.match)
    };

    const handleRobotColorNumUpdate = (event: CustomEvent<{cNum: string}>) => {
      console.log("rcnum updated to " + event.detail.cNum);
      setRobotColorNum(event.detail.cNum);
    };

    window.addEventListener('matchNumUpdate', handleMatchUpdate as EventListener);
    window.addEventListener('robotColorNumUpdate', handleRobotColorNumUpdate as EventListener);

    return () => {
      window.removeEventListener('matchNumUpdate', handleMatchUpdate as EventListener);
      window.removeEventListener('robotColorNumUpdate', handleRobotColorNumUpdate as EventListener);
    }
  }, []);

  const resetState = useCallback(
    ({ force }: { force: boolean }) => {
      console.log(
        `resetState ${data.code}`,
        `force: ${force}`,
        `behavior: ${data.formResetBehavior}`,
      );
      if (props.code === "teamNumber") {
        fetch('./teams.json')
          .then(res => res.json())
          .then(json => {
            setValue(json.matches?.[1]?.["red"]?.[1])
          })
      }

      if (force) {
        setValue(data.defaultValue);
        return;
      }
      switch (data.formResetBehavior) {
        case 'reset':
          setValue(data.defaultValue);
          return;
        case 'increment':
          setValue(prev => (typeof prev === 'number' ? prev + 1 : 1));
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
        window.dispatchEvent(new CustomEvent('matchNumUpdate', {detail: {match: parsed}}))
        console.log("weeee")
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
