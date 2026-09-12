import { SignedExtension } from "dedot";

/**
 * Asset Hub exposes opt-in transaction extensions in metadata even for legacy
 * signed (v4) extrinsics. Dedot requires explicit values for non-empty types,
 * so provide each extension's passthrough value until Relaycode supports the
 * corresponding unsigned/v5 flow.
 */
abstract class PassthroughSignedExtension<T> extends SignedExtension<T, []> {
  protected abstract readonly defaultData: T;

  async init(): Promise<void> {
    this.data = this.defaultData;
    this.additionalSigned = [];
  }

  async fromPayload(): Promise<void> {
    this.data = this.defaultData;
    this.additionalSigned = [];
  }
}

export class DisableVerifyMultiSignature extends PassthroughSignedExtension<{
  type: "Disabled";
}> {
  protected readonly defaultData = { type: "Disabled" } as const;
}

export class DisableAsPgas extends PassthroughSignedExtension<undefined> {
  protected readonly defaultData = undefined;
}

export class DisableAsDotnsGateway extends PassthroughSignedExtension<undefined> {
  protected readonly defaultData = undefined;
}

export class DisableRestrictOrigins extends PassthroughSignedExtension<boolean> {
  protected readonly defaultData = false;
}

export const relaycodeSignedExtensions = {
  VerifyMultiSignature: DisableVerifyMultiSignature,
  AsPgas: DisableAsPgas,
  AsDotnsGateway: DisableAsDotnsGateway,
  RestrictOrigins: DisableRestrictOrigins,
};
