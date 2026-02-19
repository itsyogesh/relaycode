/**
 * Reusable DedotClient mock factory for tests.
 * Used by codec, parser, and pallet-context tests.
 */
export function createMockDedotClient(overrides?: {
  registry?: Record<string, any>;
  metadata?: any;
  query?: Record<string, any>;
  consts?: Record<string, any>;
  chainSpec?: Record<string, any>;
}) {
  return {
    registry: {
      findCodec: jest.fn().mockReturnValue({
        tryEncode: jest.fn().mockReturnValue(new Uint8Array([0])),
        tryDecode: jest.fn().mockReturnValue("decoded"),
      }),
      findType: jest.fn().mockReturnValue({
        typeDef: { type: "Primitive", value: { kind: "u32" } },
      }),
      getEnumOptions: jest.fn().mockReturnValue([]),
      ...overrides?.registry,
    },
    metadata: overrides?.metadata ?? { latest: { pallets: [] } },
    query: overrides?.query ?? {},
    consts: overrides?.consts ?? {},
    chainSpec: {
      properties: jest.fn().mockResolvedValue({
        tokenDecimals: 10,
        tokenSymbol: "DOT",
      }),
      ...overrides?.chainSpec,
    },
  } as any;
}

// ─── Type Mock Factories ────────────────────────────────────────────────────

/**
 * Create an Enum type mock for DedotClient.registry.findType
 */
export function createEnumTypeMock(
  members: Array<{
    name: string;
    fields: Array<{ typeId: number; typeName: string; docs?: string[] }>;
    index: number;
    docs?: string[];
  }>
) {
  return {
    typeDef: {
      type: "Enum" as const,
      value: {
        members: members.map((m) => ({
          name: m.name,
          fields: m.fields.map((f) => ({
            typeId: f.typeId,
            typeName: f.typeName,
            docs: f.docs ?? [],
          })),
          index: m.index,
          docs: m.docs ?? [],
        })),
      },
    },
  };
}

/**
 * Create a Struct type mock for DedotClient.registry.findType
 */
export function createStructTypeMock(
  fields: Array<{
    name: string;
    typeId: number;
    typeName: string;
    docs?: string[];
  }>
) {
  return {
    typeDef: {
      type: "Struct" as const,
      value: {
        fields: fields.map((f) => ({
          name: f.name,
          typeId: f.typeId,
          typeName: f.typeName,
          docs: f.docs ?? [],
        })),
      },
    },
  };
}

/**
 * Create a Tuple type mock for DedotClient.registry.findType
 */
export function createTupleTypeMock(
  fields: Array<{ typeId: number; typeName?: string }>
) {
  return {
    typeDef: {
      type: "Tuple" as const,
      value: {
        fields: fields.map((f) => ({
          typeId: f.typeId,
          typeName: f.typeName ?? "",
        })),
      },
    },
  };
}

/**
 * Create a Sequence type mock for DedotClient.registry.findType
 */
export function createSequenceTypeMock(typeParam: number) {
  return {
    typeDef: {
      type: "Sequence" as const,
      value: { typeParam },
    },
  };
}

/**
 * Create a SizedVec type mock for DedotClient.registry.findType
 */
export function createSizedVecTypeMock(typeParam: number, len: number) {
  return {
    typeDef: {
      type: "SizedVec" as const,
      value: { typeParam, len },
    },
  };
}
