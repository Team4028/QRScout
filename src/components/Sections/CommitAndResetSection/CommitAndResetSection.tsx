import { QRModal } from '@/components/QR';
import React, { useEffect, useMemo } from 'react';
import { useQRScoutState } from '../../../store/store';
import { Section } from '../../core/Section';
import { ResetButton } from './ResetButton';

export function CommitAndResetSection() {

    const [ranks, setRanks] = React.useState<Array<Array<string>>>([['1', '2', '3'], ['1', '2', '3'], ['1', '2', '3'], ['1', '2', '3'], ['1', '2', '3']]);
    const [ranksValid, setRanksValid] = React.useState<boolean>(true);

    useEffect(() => {
        const handleChangeRankNum = (event: CustomEvent<{ i: number, j: number, data: string }>) => {
            let r2 = ranks;
            console.log(event.detail);
            r2[event.detail.i][event.detail.j] = event.detail.data;
            setRanks(r2);
            let good: boolean = true;
            for (const ranksi of ranks) {
                good &&= ranksi.length === new Set(ranksi).size;
            }
            setRanksValid(good);
        };

        window.addEventListener("changeRankNum", handleChangeRankNum as EventListener);
    }, []);

    const formData = useQRScoutState(state => state.formData);
    const fieldValues = useQRScoutState(state => state.fieldValues);

    const requiredFields = useMemo(() => {
        return formData.sections
            .map(s => s.fields)
            .flat()
            .filter(f => f.required)
            .map(f => f.code);
    }, [formData]);

    const missingRequiredFields = useMemo(() => {
        console.log(ranksValid);
        return ((fieldValues
            .filter(f => requiredFields.includes(f.code))
            .some(f => f.value === undefined || f.value === '' || f.value === "'" || f.value === null)) || !ranksValid);
    }, [formData, fieldValues]);

    return (
        <Section>
            <QRModal disabled={missingRequiredFields} />
            <ResetButton />
        </Section>
    );
}
