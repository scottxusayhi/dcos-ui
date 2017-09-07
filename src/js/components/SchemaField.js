import React, { Component } from "react";
import deepEqual from "deep-equal";
import { Tooltip } from "reactjs-components";
import DefaultSchemaField
  from "react-jsonschema-form/lib/components/fields/SchemaField";

import Icon from "#SRC/js/components/Icon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FieldError from "#SRC/js/components/form/FieldError";

class SchemaField extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      !deepEqual(nextProps.formData, this.props.formData) ||
      !deepEqual(nextProps.uiSchema, this.props.uiSchema)
    );
  }

  getFieldContent(errorMessage) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      autofocus,
      onFocus
    } = this.props;

    if (schema.type === "boolean") {
      return (
        <FieldLabel>
          <FieldInput
            id={name}
            type={"checkbox"}
            name={name}
            checked={formData}
            onChange={event => onChange(event.target.checked)}
          />
          {this.getFieldHeading(required, name, schema.description)}
          <FieldError>{errorMessage}</FieldError>
        </FieldLabel>
      );
    } else if (
      schema.type === "string" ||
      schema.type === "number" ||
      schema.type === "integer"
    ) {
      return (
        <div>
          <FieldLabel>
            {this.getFieldHeading(required, name, schema.description)}
          </FieldLabel>
          <FieldInput
            id={name}
            type={schema.type === "string" ? "text" : "number"}
            className={schema.type === "string" ? "" : "sdk-number-input"}
            autoFocus={autofocus}
            name={name}
            value={formData}
            onChange={event => onChange(event.target.value)}
            onBlur={onBlur && (event => onBlur(name, event.target.value))}
            onFocus={onFocus && (event => onFocus(name, event.target.value))}
          />
          <FieldError>{errorMessage}</FieldError>
        </div>
      );
    }
  }

  getFieldHeading(required, name, description) {
    let asterisk = null;
    if (required) {
      asterisk = (
        <FormGroupHeadingContent className="text-danger" primary={false}>
          *
        </FormGroupHeadingContent>
      );
    }

    return (
      <FormGroupHeading>
        <FormGroupHeadingContent primary={true}>
          {name.split("_").join(" ")}
        </FormGroupHeadingContent>
        {asterisk}
        <FormGroupHeadingContent primary={false}>
          <Tooltip
            content={description}
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    );
  }

  // these props are passed from the react-jsonschema-form library
  render() {
    const { required, schema, formData } = this.props;

    if (schema.type === "object") {
      return <DefaultSchemaField {...this.props} />;
    }

    let errorMessage = "";
    if (required && formData === "") {
      errorMessage = `expected a ${schema.type} here`;
    }

    return (
      <FormGroup
        showError={Boolean(errorMessage)}
        errorClassName="form-group-danger"
      >
        {this.getFieldContent(errorMessage)}
      </FormGroup>
    );
  }
}

export default SchemaField;
