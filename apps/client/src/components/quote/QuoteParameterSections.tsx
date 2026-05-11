import { SectionHeading } from '../cards';
import { quoteParameterSections, type QuoteParameterField } from '../../quoteParameterConfig';
import type { QuoteInput } from '../../types';

interface QuoteParameterSectionsProps {
  input: QuoteInput;
  onChange: (key: keyof QuoteInput, value: QuoteInput[keyof QuoteInput]) => void;
}

export function QuoteParameterSections({ input, onChange }: QuoteParameterSectionsProps) {
  return (
    <>
      {quoteParameterSections.map((section) => (
        <section className="lc-card lc-form-panel" key={section.key}>
          <SectionHeading title={section.title} desc={section.description} />
          <div className="lc-form-grid">
            {section.fields
              .filter((field) => isVisible(field, input))
              .map((field) => (
                <QuoteField key={field.name} field={field} input={input} onChange={onChange} />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

function QuoteField({
  field,
  input,
  onChange,
}: {
  field: QuoteParameterField;
  input: QuoteInput;
  onChange: (key: keyof QuoteInput, value: QuoteInput[keyof QuoteInput]) => void;
}) {
  const value = input[field.name];

  if (field.type === 'checkbox') {
    return (
      <label className="field lc-field-checkbox">
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked as QuoteInput[keyof QuoteInput])}
          type="checkbox"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="field lc-field-wide">
        <span>{field.label}</span>
        <textarea
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value as QuoteInput[keyof QuoteInput])}
        />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      {field.type === 'select' ? (
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(field.name, event.target.value as QuoteInput[keyof QuoteInput])}
        >
          <option value="">请选择</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          min={field.min}
          placeholder={field.placeholder}
          type={field.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(event) => {
            const next = field.type === 'number' ? Number(event.target.value) : event.target.value;
            onChange(field.name, next as QuoteInput[keyof QuoteInput]);
          }}
        />
      )}
    </label>
  );
}

function isVisible(field: QuoteParameterField, input: QuoteInput): boolean {
  if (!field.visibleWhen) {
    return true;
  }
  return Object.entries(field.visibleWhen).every(([key, expected]) => input[key as keyof QuoteInput] === expected);
}
