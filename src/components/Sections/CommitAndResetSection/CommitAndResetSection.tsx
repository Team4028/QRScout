import { QRModal } from '@/components/QR';
import { useMemo } from 'react';
import { useQRScoutState } from '../../../store/store';
import { Section } from '../../core/Section';
import { ResetButton } from './ResetButton';
import { Config } from '@/components/inputs/BaseInputProps';

function checkAllMutualFields(formData: Config, values: { code: string, value: any }[]) {
    let mutualGood: boolean = true
    for (const section of formData.sections) {
        for (const field of section.fields) {
            if (!field.mutualWith || field.mutualWith?.length <= 0) continue;
            const value = values.find(f => f.code === field.code)?.value ?? null;
            if (value !== null) {
                for (const otherField of field.mutualWith) {
                    const otherValue = values.find(f => f.code === otherField)?.value ?? null;
                    if (otherValue === value) {
                        mutualGood = false;
                        break;
                    }
                }
            }
        } 
    }

    return mutualGood;
}

export function CommitAndResetSection() {
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
    return fieldValues
      .filter(f => requiredFields.includes(f.code))
      .some(f => f.value === undefined || f.value === '' || f.value === null) || !checkAllMutualFields(formData, fieldValues);
  }, [formData, fieldValues]);

  return (
    <Section>
      <QRModal disabled={missingRequiredFields} />
      <ResetButton />
    </Section>
  );
}
