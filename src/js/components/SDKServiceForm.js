import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import mixin from "reactjs-mixin";
import classNames from "classnames";
import DefaultTitleField
  from "react-jsonschema-form/lib/components/fields/TitleField";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import Util from "#SRC/js/utils/Util";
import JSONEditor from "#SRC/js/components/JSONEditor";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader
  from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions
  from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle
  from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import ToggleButton from "#SRC/js/components/ToggleButton";

import SchemaForm from "react-jsonschema-form";
import SchemaField from "./SchemaField";

export default class SDKServiceForm extends mixin(StoreMixin) {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: null,
      formData: null,
      jsonEditorActive: false,
      packageDetails: null
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["serviceDescriptionError", "serviceDescriptionSuccess"]
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    CosmosPackagesStore.fetchServiceDescription(this.props.params.id);
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const packageDetails = CosmosPackagesStore.getServiceDetails();
    this.setState({ packageDetails });

    // first in the list of tabs (todo, probably a better way)
    const activeTab = Object.keys(packageDetails.config.properties)[0];
    this.setState({ activeTab });

    // formdata
    const formData = this.initializeFormData(packageDetails.config);
    this.setState({ formData });
  }

  initializeFormData(value) {
    if (!Util.isObject(value)) {
      return value;
    }
    if (!value.properties) {
      return value.default;
    }

    const defaults = {};
    Object.keys(value.properties).forEach(property => {
      defaults[property] = this.initializeFormData(value.properties[property]);
    });

    return defaults;
  }

  getFormattedSectionLabel(label) {
    return label
      .toLowerCase()
      .split("_")
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  // todo add the tab error badge...probably pass in
  getFormTabList() {
    const { packageDetails } = this.state;
    const schema = packageDetails.config;

    return Object.keys(schema.properties).map(tabName => {
      return (
        <TabButton
          label={this.getFormattedSectionLabel(tabName)}
          id={tabName}
          key={tabName}
        />
      );
    });
  }

  handleTabChange(activeTab) {
    this.setState({ activeTab });
  }

  handleJSONToggle() {
    this.setState({ jsonEditorActive: !this.state.jsonEditorActive });
  }

  getUiSchema() {
    const { packageDetails, activeTab } = this.state;
    const schema = packageDetails.config;

    const uiSchema = {};
    Object.keys(schema.properties).forEach(key => {
      if (key !== activeTab) {
        uiSchema[key] = { classNames: "hidden" };
      }
    });

    return uiSchema;
  }

  handleFormChange(form) {
    const formData = form.formData;
    this.setState({ formData });
  }

  handleGoBack() {
    console.log("back clicked");
  }

  handleServiceReview() {
    console.log("review clicked");
  }

  handleJSONChange(formData) {
    this.setState({ formData });
  }

  getSecondaryActions() {
    return [
      {
        className: "button-stroke",
        clickHandler: this.handleGoBack,
        label: "Back"
      }
    ];
  }

  getPrimaryActions() {
    const { jsonEditorActive } = this.state;

    return [
      {
        node: (
          <ToggleButton
            className="flush"
            checkboxClassName="toggle-button toggle-button-align-left"
            checked={jsonEditorActive}
            onChange={this.handleJSONToggle.bind(this)}
            key="json-editor"
          >
            JSON Editor
          </ToggleButton>
        )
      },
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleServiceReview,
        label: "Review & Run"
      }
    ];
  }

  getHeader() {
    const { packageDetails } = this.state;

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary"
        />
        <FullScreenModalHeaderTitle>
          <div>
            Edit Configuration
          </div>
          <span className="small">
            {packageDetails.description + " " + packageDetails.version}
          </span>
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }

  render() {
    const {
      activeTab,
      packageDetails,
      formData,
      jsonEditorActive
    } = this.state;

    if (packageDetails == null) {
      return <div>loading</div>;
    }

    const schema = packageDetails.config;

    // don't display asterisk on headings
    const TitleField = props => {
      return <DefaultTitleField {...props} required={false} />;
    };

    const jsonEditorClasses = classNames("modal-full-screen-side-panel", {
      "is-visible": jsonEditorActive
    });

    return (
      <FullScreenModal
        header={this.getHeader.apply(this)}
        useGemini={true}
        open={true}
      >
        <Tabs
          activeTab={activeTab}
          handleTabChange={this.handleTabChange.bind(this)}
          vertical={true}
        >
          <TabButtonList>
            {this.getFormTabList()}
          </TabButtonList>
          <SchemaForm
            schema={schema}
            formData={formData}
            onChange={this.handleFormChange.bind(this)}
            uiSchema={this.getUiSchema()}
            fields={{ SchemaField, TitleField }}
          >
            <div />
          </SchemaForm>
        </Tabs>
        <div className={jsonEditorClasses}>
          <JSONEditor
            showGutter={true}
            showPrintMargin={false}
            onChange={this.handleJSONChange.bind(this)}
            theme="monokai"
            height="100%"
            value={formData}
            width="100%"
          />
        </div>
      </FullScreenModal>
    );
  }
}
