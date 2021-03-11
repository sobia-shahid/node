import React from 'react';
import { Formik, Field, ErrorMessage } from 'formik';

const Aux = (props) => {
  return props.children;
};

const CustomField = (props) => {
  return (
    <Aux>
      <label for={props.name}>
        <i className={props.labelClass} /> {props.label}
      </label>
      <Field value={props.value} onChange={props.changed} onBlur={props.blured} {...props} />
      <div className="error">
        <ErrorMessage name={props.name} />
      </div>
    </Aux>
  );
};
export default CustomField;
