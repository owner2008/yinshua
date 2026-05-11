export const adhesiveTypeValues = ['permanent', 'removable', 'strong', 'freezer', 'heat_resistant'] as const;
export const deliveryFormValues = ['roll', 'sheet', 'sheet_cut', 'fan_fold'] as const;
export const surfaceFinishValues = [
  'matte_lamination',
  'gloss_lamination',
  'matte_varnish',
  'gloss_varnish',
  'scratch_resistant',
  'waterproof',
  'white_ink',
] as const;
export const colorModeValues = ['four_color', 'black', 'spot_color', 'four_color_white_ink', 'variable_data'] as const;
export const labelingMethodValues = ['manual', 'automatic', 'semi_automatic'] as const;
export const rollDirectionValues = ['top_out', 'bottom_out', 'left_out', 'right_out', 'inside', 'outside'] as const;

export const fullLabelParameterSupport = {
  adhesiveTypes: [...adhesiveTypeValues],
  deliveryForms: [...deliveryFormValues],
  surfaceFinishes: [...surfaceFinishValues],
  colorModes: [...colorModeValues],
  labelingMethods: [...labelingMethodValues],
};
