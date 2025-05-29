
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelSide?: 'left' | 'right';
  containerClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, labelSide = 'right', containerClassName, className, ...props }) => {
  const baseStyles = "h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const checkboxElement = (
    <input
      type="checkbox"
      id={id}
      className={`${baseStyles} ${className || ''}`}
      {...props}
    />
  );

  const labelElement = label ? (
    <label htmlFor={id} className="ml-2 text-sm text-gray-700 cursor-pointer">
      {label}
    </label>
  ) : null;

  return (
    <div className={`flex items-center ${containerClassName || ''}`}>
      {labelSide === 'left' && labelElement}
      {checkboxElement}
      {labelSide === 'right' && labelElement}
    </div>
  );
};

export default Checkbox;
