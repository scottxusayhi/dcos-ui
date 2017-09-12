const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const Config = require("#SRC/js/config/Config");
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const SDKEndpointsActions = require("../SDKEndpointActions");

describe("SDKEndpointsActions", function() {
  describe("#fetchEndpoints", function() {
    const serviceId = "foo";

    context("#dispatcher", function() {
      it("dispatches the loading action first", function() {
        SDKEndpointsActions.fetchEndpoints(serviceId);

        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_SDK_ENDPOINTS_LOADING
          );
        });
      });
    });

    context("#RequestUtil", function() {
      beforeEach(function() {
        spyOn(RequestUtil, "json");
        SDKEndpointsActions.fetchEndpoints(serviceId);
        this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", function() {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("sends data to the correct URL", function() {
        expect(this.configuration.url).toEqual(
          `${Config.rootUrl}/service/${serviceId}/v1/endpoints`
        );
      });

      it("uses POST for the request method", function() {
        expect(this.configuration.method).toEqual("GET");
      });

      it("dispatches the correct action when successful", function() {
        const id = AppDispatcher.register(function(payload) {
          const action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(
            ActionTypes.REQUEST_SDK_ENDPOINTS_SUCCESS
          );
        });

        this.configuration.success({
          serviceId
        });
      });

      it("dispatches the correct action when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.type).toEqual(ActionTypes.REQUEST_SDK_ENDPOINTS_ERROR);
        });

        this.configuration.error({ message: "error" });
      });

      it("dispatches the xhr when unsuccessful", function() {
        var id = AppDispatcher.register(function(payload) {
          var action = payload.action;
          AppDispatcher.unregister(id);
          expect(action.xhr).toEqual({
            responseJSON: { description: "foo" }
          });
        });

        this.configuration.error({
          responseJSON: { description: "foo" }
        });
      });
    });
  });
});
