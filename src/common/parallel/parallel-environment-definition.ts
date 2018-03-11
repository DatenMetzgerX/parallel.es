import { IParallelEnvironment } from "./parallel-environment";
import { FunctionCall } from "../function/function-call";
import { ISerializedFunctionCall } from "../function/serialized-function-call";
import { FunctionCallSerializer } from "../function/function-call-serializer";

/**
 * Defines the environment for a parallel chain. The environment can consist of one or multiple static environments or
 * environments created by using an environment provider. The environments are merged in the order they have been added
 * to the parallel chain, meaning that later environments override the properties of earlier environments.
 * The implementation tries to minimize the number of environment variables to transfer by merging the environments as much
 * as possible while still maintaining the sequential order of the environments.
 */
export class ParallelEnvironmentDefinition {
  public static of(environment?: FunctionCall | IParallelEnvironment) {
    const definition = ParallelEnvironmentDefinition.EMPTY;
    if (environment) {
      return definition.add(environment);
    }
    return definition;
  }

  private static EMPTY = new ParallelEnvironmentDefinition();

  private constructor(public environments: Array<IParallelEnvironment | FunctionCall> = []) {}

  /**
   * Adds the given environment
   *
   * The operation tries to keep the operation chain to a minimal in length. If two subsequent environments are
   * not providers, then the definitions are merged.
   * @param environment the new environment to add
   * @returns {ParallelEnvironmentDefinition} the new parallel environment resulting from adding the passed in environment
   * to the existing one
   */
  public add(environment: FunctionCall | IParallelEnvironment): ParallelEnvironmentDefinition {
    const newEnvironments = this.environments.slice();
    if (
      !(environment instanceof FunctionCall) &&
      this.environments.length > 0 &&
      !(this.environments[this.environments.length - 1] instanceof FunctionCall)
    ) {
      newEnvironments[newEnvironments.length - 1] = {
        ...newEnvironments[newEnvironments.length - 1],
        ...environment
      };
    } else {
      newEnvironments.push(environment);
    }

    return new ParallelEnvironmentDefinition(newEnvironments);
  }

  public toJSON(functionCallSerializer: FunctionCallSerializer): Array<ISerializedFunctionCall | IParallelEnvironment> {
    return this.environments.map(environment => {
      if (environment instanceof FunctionCall) {
        return functionCallSerializer.serializeFunctionCall(environment);
      }
      return environment;
    });
  }
}
