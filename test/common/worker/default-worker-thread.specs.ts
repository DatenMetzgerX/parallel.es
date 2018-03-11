import {
  WorkerMessageType,
  requestFunctionMessage,
  workerResultMessage,
  functionExecutionError,
  IWorkerMessage
} from "../../../src/common/worker/worker-messages";
import { IFunctionDefinition } from "../../../src/common/function/function-defintion";
import { ITaskDefinition } from "../../../src/common/task/task-definition";
import { DynamicFunctionRegistry } from "../../../src/common/function/dynamic-function-registry";
import { functionId } from "../../../src/common/function/function-id";
import { DefaultWorkerThread } from "../../../src/common/worker/default-worker-thread";

describe("DefaultWorkerThread", function() {
  let communicationChannel: {
    sendMessage: jasmine.Spy;
    addEventListener(event: "message", handler: (event: IWorkerMessage) => void): void;
  };
  let workerThread: DefaultWorkerThread;
  let functionLookupTable: DynamicFunctionRegistry;
  let slaveRespond: (message: IWorkerMessage) => void;

  beforeEach(function() {
    communicationChannel = {
      sendMessage: jasmine.createSpy("sendMessage"),
      addEventListener(event: string, handler: (message: IWorkerMessage) => void): void {
        if (event === "message") {
          slaveRespond = handler;
        }
      }
    };
    functionLookupTable = new DynamicFunctionRegistry();
    workerThread = new DefaultWorkerThread(functionLookupTable, communicationChannel as any);
  });

  it("is in default state by default", function() {
    expect(workerThread.state.name).toBe("default");
  });

  describe("initialize", function() {
    it("sends an initialize message to the slave containing the worker id", function() {
      // act
      workerThread.initialize();

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.InitializeWorker,
        workerId: workerThread.id
      });
    });

    it("is in idle state thereafter", function() {
      // act
      workerThread.initialize();

      // assert
      expect(workerThread.state.name).toBe("idle");
    });

    it("fails if the worker is not in the default state", function() {
      // arrange
      workerThread.initialize();

      // act, assert
      expect(() => workerThread.initialize()).toThrowError(
        "The worker thread can only be initialized if in state default but actual state is 'idle'."
      );
    });
  });

  describe("run", function() {
    it("sends the schedule task message to the slave containing the task definition", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      workerThread.initialize();

      // act
      workerThread.run(task, () => undefined);

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledWith({ type: WorkerMessageType.ScheduleTask, task });
    });

    it("is in executing state while executing", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      workerThread.initialize();

      // act
      workerThread.run(task, () => undefined);

      // assert
      expect(workerThread.state.name).toBe("executing");
    });

    it("sends the function definition to the slave if the definition is requested", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const functionDefinition: IFunctionDefinition = {
        argumentNames: ["x", "y"],
        body: "x + y;",
        id: task.main.functionId
      };
      spyOn(functionLookupTable, "getDefinition").and.returnValue(functionDefinition);
      workerThread.initialize();
      workerThread.run(task, () => undefined);

      // act
      slaveRespond(requestFunctionMessage(task.main.functionId));

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledWith({
        functions: [functionDefinition],
        missingFunctions: [],
        type: WorkerMessageType.FunctionResponse
      });
    });

    it("names missing function definitions in the function response", function() {
      // arrange
      const mainId = functionId("test", 1);
      const missingId = functionId("missing", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId, missingId]
      };
      const functionDefinition: IFunctionDefinition = {
        argumentNames: ["x", "y"],
        body: "x + y;",
        id: task.main.functionId
      };
      spyOn(functionLookupTable, "getDefinition").and.returnValues(functionDefinition, undefined);
      workerThread.initialize();
      workerThread.run(task, () => undefined);

      // act
      slaveRespond(requestFunctionMessage(task.main.functionId, missingId));

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledWith({
        functions: [functionDefinition],
        missingFunctions: [missingId],
        type: WorkerMessageType.FunctionResponse
      });
    });

    it("invokes the callback with the result received from the worker slave", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");
      workerThread.initialize();

      workerThread.run(task, callback);

      // act
      slaveRespond(workerResultMessage(10));

      // assert
      expect(callback).toHaveBeenCalledWith(undefined, 10);
    });

    it("triggers the callback if an error message has been retrieved from the worker", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");
      workerThread.initialize();
      workerThread.run(task, callback);

      // act
      slaveRespond(functionExecutionError(new Error("Failed to execute the function")));

      // assert
      expect(callback).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringMatching("Failed to execute the function")
        }),
        undefined
      );
    });

    it("throws an error if the slave sends an unexpected message", function() {
      // act, assert
      expect(() => slaveRespond({ txt: "Unknown message", type: 9999999 } as any)).toThrowError(
        "Worker thread in state 'default' cannot handle the received message (9999999)."
      );
    });

    it("fails if the worker thread is not in idle state", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");

      // act, assert
      expect(() => workerThread.run(task, callback)).toThrowError(
        "The worker thread can only execute a new task if in state idle but actual state is 'default'."
      );
    });

    it("switches back to idle state if execution has completed", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");

      workerThread.initialize();
      workerThread.run(task, callback);

      // act
      slaveRespond(workerResultMessage(10));

      // assert
      expect(workerThread.state.name).toEqual("idle");
    });

    it("is in stopped state after function completed but when stop was requested", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");

      workerThread.initialize();
      workerThread.run(task, callback);

      // act
      workerThread.stop();
      slaveRespond(workerResultMessage(10));

      // assert
      expect(workerThread.state.name).toEqual("stopped");
    });
  });

  describe("stop", function() {
    it("sends the stop message to the slave", function() {
      // act
      workerThread.stop();

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledWith({ type: WorkerMessageType.Stop });
    });

    it("is in stopped state thereafter", function() {
      // act
      workerThread.stop();

      // assert
      expect(workerThread.state.name).toBe("stopped");
    });

    it("does not resent the stop message if already stopped", function() {
      // act
      workerThread.stop();
      workerThread.stop();

      // assert
      expect(communicationChannel.sendMessage).toHaveBeenCalledTimes(1);
    });

    it("is still in executing state if stopped while executing", function() {
      // arrange
      const mainId = functionId("test", 1);
      const task: ITaskDefinition = {
        main: { ______serializedFunctionCall: true, functionId: mainId, parameters: [] },
        usedFunctionIds: [mainId]
      };
      const callback = jasmine.createSpy("callback");

      workerThread.initialize();
      workerThread.run(task, callback);

      // act
      workerThread.stop();

      // assert
      expect(workerThread.state.name).toEqual("executing");
    });
  });
});
