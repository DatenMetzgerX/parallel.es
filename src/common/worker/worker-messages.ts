import { ITaskDefinition } from "../task/task-definition";
import { IFunctionDefinition } from "../function/function-defintion";
import { IFunctionId } from "../function/function-id";

/**
 * Message types
 */
export const enum WorkerMessageType {
  /**
   * Sent from the worker facade to the worker slave to initialize the slave.
   */
  InitializeWorker,

  /**
   * Sent from the worker facade to the worker slave to schedule a new task on the slave.
   */
  ScheduleTask,

  /**
   * Send from the worker slave to the worker thread to request the definition of a function needed to execute a scheduled task
   */
  FunctionRequest,

  /**
   * Send from the worker thread to the worker slave as response to a {@link WorkerMessageType.FunctionRequest}. Includes
   * the definitions of all requested functions
   */
  FunctionResponse,

  /**
   * Sent from the worker slave to the worker thread containing the computed result
   */
  WorkerResult,

  /**
   * Sent from the worker slave to the worker thread for the case an error occurred during the evaluation of the scheduled task.
   */
  FunctionExecutionError,

  /**
   * Sent from the worker thread to the worker slave to request the slave to terminate.
   */
  Stop
}

/**
 * Message that is exchanged between a worker slave and the worker thread.
 */
export interface IWorkerMessage {
  /**
   * The type of the message.
   */
  type: WorkerMessageType;
}

/**
 * Sent to initialize the worker slave and assigns the given unique id
 */
export interface IInitializeWorkerMessage extends IWorkerMessage {
  /**
   * Unique id of the worker (facade / slave)
   */
  workerId: number;
}

/**
 * Schedules the given task on the worker slave.
 */
export interface IScheduleTaskMessage extends IWorkerMessage {
  /**
   * Task to execute on the worker slave
   */
  task: ITaskDefinition;
}

/**
 * Sent by the worker slave to request the function definitions with the given ids.
 */
export interface IFunctionRequest extends IWorkerMessage {
  /**
   * The ids of the requested functions
   */
  functionIds: IFunctionId[];
}

/**
 * Response to a {@link IFunctionRequest}. Contains the definitions for all requested functions.
 */
export interface IFunctionResponse extends IWorkerMessage {
  /**
   * The definition of the requested functions
   */
  functions: IFunctionDefinition[];

  /**
   * Array containing the ids of the functions that could not be resolved
   */
  missingFunctions: IFunctionId[];
}

/**
 * Sent from the worker slave to the worker thread to report the computed result.
 * Thereafter, the worker slave is ready to accept further tasks.
 */
export interface IWorkerResultMessage extends IWorkerMessage {
  /**
   * The computed result for the {@link IScheduleTaskMessage}
   */
  result: any;
}

/**
 * Sent from the worker to report an error during the execution of the function.
 */
export interface IFunctionExecutionError extends IWorkerMessage {
  /**
   * The occurred error. Not an instance of Error. Error is not cloneable.
   */
  error: any;
}

/**
 * Creates an initialize worker message
 * @param id the unique id of the worker
 * @returns the initialize worker message
 */
export function initializeWorkerMessage(id: number): IInitializeWorkerMessage {
  return { type: WorkerMessageType.InitializeWorker, workerId: id };
}

/**
 * Creates a message to schedule the given task on a worker slave
 * @param task the task to schedule
 * @returns the schedule message
 */
export function scheduleTaskMessage(task: ITaskDefinition): IScheduleTaskMessage {
  return { task, type: WorkerMessageType.ScheduleTask };
}

/**
 * Creates an {@link IFunctionRequest} message that requests the given function ids from the worker thread
 * @param functionId the id of a function to request
 * @param otherFunctionIds additional ids to request from the worker slave
 * @returns the function request message
 */
export function requestFunctionMessage(functionId: IFunctionId, ...otherFunctionIds: IFunctionId[]): IFunctionRequest {
  return {
    functionIds: [functionId, ...otherFunctionIds],
    type: WorkerMessageType.FunctionRequest
  };
}

/**
 * Creates a function response message containing the passed function definitions
 * @param functions the function definitions to respond to the worker slave
 * @returns the function response message
 */
export function functionResponseMessage(
  functions: IFunctionDefinition[],
  ...missingFunctionIds: IFunctionId[]
): IFunctionResponse {
  return {
    functions,
    missingFunctions: missingFunctionIds,
    type: WorkerMessageType.FunctionResponse
  };
}

/**
 * Creates a worker result message for the given result
 * @param result the computed result for the scheduled task
 * @returns the message
 */
export function workerResultMessage(result: any): IWorkerResultMessage {
  return { result, type: WorkerMessageType.WorkerResult };
}

/**
 * Creates a function execution error message containing the given error
 * @param error the error object thrown by the task computation
 * @returns the message
 */
export function functionExecutionError(error: Error): IFunctionExecutionError {
  const errorObject: { [prop: string]: string } = {};

  for (const prop of Object.getOwnPropertyNames(error)) {
    errorObject[prop] = JSON.stringify((error as any)[prop]);
  }

  return { error: errorObject, type: WorkerMessageType.FunctionExecutionError };
}

/**
 * Creates a stop message
 * @returns the message
 */
export function stopMessage(): IWorkerMessage {
  return { type: WorkerMessageType.Stop };
}

/**
 * Tests if the given message is an {@link IScheduleTaskMessage} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IScheduleTaskMessage}
 */
export function isScheduleTask(message: IWorkerMessage): message is IScheduleTaskMessage {
  return message.type === WorkerMessageType.ScheduleTask;
}

/**
 * Tests if the given message is an {@link IInitializeWorkerMessage} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IInitializeWorkerMessage}
 */
export function isInitializeMessage(message: IWorkerMessage): message is IInitializeWorkerMessage {
  return message.type === WorkerMessageType.InitializeWorker;
}

/**
 * Tests if the given message is an {@link IFunctionRequest} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IFunctionRequest}
 */
export function isFunctionRequest(message: IWorkerMessage): message is IFunctionRequest {
  return message.type === WorkerMessageType.FunctionRequest;
}

/**
 * Tests if the given message is an {@link IFunctionResponse} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IFunctionResponse}
 */
export function isFunctionResponse(message: IWorkerMessage): message is IFunctionResponse {
  return message.type === WorkerMessageType.FunctionResponse;
}

/**
 * Tests if the given message is an {@link IWorkerResultMessage} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IWorkerResultMessage}
 */
export function isWorkerResult(message: IWorkerMessage): message is IWorkerResultMessage {
  return message.type === WorkerMessageType.WorkerResult;
}

/**
 * Tests if the given message is an {@link IFunctionExecutionError} message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is an {@link IFunctionExecutionError}
 */
export function isFunctionExecutionError(message: IWorkerMessage): message is IFunctionExecutionError {
  return message.type === WorkerMessageType.FunctionExecutionError;
}

/**
 * Tests if the given message is a stop message
 * @param message the message to test
 * @returns {boolean} {@code true} if the message is a stop message
 */
export function isStopMesssage(message: IWorkerMessage): boolean {
  return message.type === WorkerMessageType.Stop;
}
