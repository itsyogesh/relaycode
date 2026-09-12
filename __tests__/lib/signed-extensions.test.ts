import {
  DisableAsDotnsGateway,
  DisableAsPgas,
  DisableRestrictOrigins,
  DisableVerifyMultiSignature,
  relaycodeSignedExtensions,
} from "@/lib/signed-extensions";

const createExtension = <T extends new (...args: any[]) => any>(Extension: T) =>
  new Extension({} as any, {} as any);

describe("Relaycode signed extension defaults", () => {
  it("disables VerifyMultiSignature for legacy signed extrinsics", async () => {
    const extension = createExtension(DisableVerifyMultiSignature);

    await extension.init();

    expect(extension.data).toEqual({ type: "Disabled" });
    expect(extension.additionalSigned).toEqual([]);
  });

  it("uses the passthrough values expected by Asset Hub", async () => {
    const pgas = createExtension(DisableAsPgas);
    const dotns = createExtension(DisableAsDotnsGateway);
    const origins = createExtension(DisableRestrictOrigins);

    await Promise.all([pgas.init(), dotns.init(), origins.init()]);

    expect(pgas.data).toBeUndefined();
    expect(dotns.data).toBeUndefined();
    expect(origins.data).toBe(false);
  });

  it("registers every currently opt-in Asset Hub extension", () => {
    expect(Object.keys(relaycodeSignedExtensions)).toEqual([
      "VerifyMultiSignature",
      "AsPgas",
      "AsDotnsGateway",
      "RestrictOrigins",
    ]);
  });
});
