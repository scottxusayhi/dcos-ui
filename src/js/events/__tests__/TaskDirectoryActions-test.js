jest.dontMock('../TaskDirectoryActions');
jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');

const RequestUtil = require('mesosphere-shared-reactjs').RequestUtil;

const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../../events/AppDispatcher');
const TaskDirectoryActions = require('../TaskDirectoryActions');
const Config = require('../../config/Config');

describe('TaskDirectoryActions', function () {

  beforeEach(function () {
    this.configuration = null;
    this.requestUtilJSON = RequestUtil.json;
    RequestUtil.json = function (configuration) {
      this.configuration = configuration;
    }.bind(this);
    this.configRootUrl = Config.rootUrl;
    this.configUseFixtures = Config.useFixtures;
    Config.rootUrl = '';
    Config.useFixtures = false;
  });

  afterEach(function () {
    RequestUtil.json = this.requestUtilJSON;
    Config.rootUrl = this.configRootUrl;
    Config.useFixtures = this.configUseFixtures;
  });

  describe('#getInnerPath', function () {

    it('finds path of a running task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {frameworks: [{id: 'foo', executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a task in completed executors', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a task in completed frameworks', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task with executor id', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', executor_id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

  });

  describe('#fetchDirectory', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      TaskDirectoryActions.fetchDirectory(
        {framework_id: 'foo', id: 'bar', slave_id: 'baz'},
        '',
        {frameworks: [{id: 'foo', executors: [{id: 'bar', directory: 'quis'}]}]}
      );
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(this.configRootUrl + '/agent/baz/files/browse');
    });

    it('fetches data with path in data', function () {
      expect(this.configuration.data)
        .toEqual({path: 'quis/'});
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS);
        expect(action.taskID).toEqual('bar');
        expect(action.innerPath).toEqual('');
        expect(action.data).toEqual('directory');
      });

      this.configuration.success('directory');
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_TASK_DIRECTORY_ERROR);
        expect(action.data).toEqual('foo');
        expect(action.taskID).toEqual('bar');
      });

      this.configuration.error({message: 'foo'});
    });

  });

});
