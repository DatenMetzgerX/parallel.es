import { initializeWorkerMessage } from "../../../src/common/worker/worker-messages";
import { IdleWorkerSlaveState } from "../../../src/common/worker/worker-slave-states";
import { SlaveFunctionLookupTable } from "../../../src/common/function/slave-function-lookup-table";
import { AbstractWorkerSlave } from "../../../src/common/worker/abstract-worker-slave";

describe("AbstractWorkerSlave", function() {
  let slave: AbstractWorkerSlave;
  let functionLookupTable: SlaveFunctionLookupTable;

  beforeEach(function() {
    functionLookupTable = new SlaveFunctionLookupTable();
    slave = new TestWorkerSlave(functionLookupTable);
  });

  describe("changeState", function() {
    it("calls enter on the passed state", function() {
      // arrange
      const state = new IdleWorkerSlaveState(slave);
      const enterSpy = spyOn(state, "enter");

      // act
      slave.changeState(state);

      // assert
      expect(enterSpy).toHaveBeenCalled();
    });
  });

  describe("onMessage", function() {
    it("calls onMessage of the current state", function() {
      // arrange
      const state = new IdleWorkerSlaveState(slave);
      spyOn(state, "enter");
      const onMessageSpy = spyOn(state, "onMessage").and.returnValue(true);
      const message = initializeWorkerMessage(10);
      slave.changeState(state);

      // act
      slave.onMessage(message);

      // assert
      expect(onMessageSpy).toHaveBeenCalledWith(message);
    });

    it("throws an error if the state cannot handle the given message", function() {
      // arrange
      const state = new IdleWorkerSlaveState(slave);
      spyOn(state, "enter");
      spyOn(state, "onMessage").and.returnValue(false);
      const message = initializeWorkerMessage(10);
      slave.changeState(state);

      // act, assert
      expect(() => slave.onMessage(message)).toThrowError(
        `Message with type 0 cannot be handled by Slave { id: NaN, state: 'Idle' }`
      );
    });
  });

  class TestWorkerSlave extends AbstractWorkerSlave {
    public postMessage(message: any): void {
      // intentional
    }

    protected terminate(): void {
      // intentional
    }
  }
});
