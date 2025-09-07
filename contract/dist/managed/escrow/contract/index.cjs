'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.8.1';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

class _ZswapCoinPublicKey_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_2 = new _ZswapCoinPublicKey_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = new __compactRuntime.CompactTypeEnum(2, 1);

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _CoinInfo_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment()));
  }
  fromValue(value_0) {
    return {
      nonce: _descriptor_1.fromValue(value_0),
      color: _descriptor_1.fromValue(value_0),
      value: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.nonce).concat(_descriptor_1.toValue(value_0.color).concat(_descriptor_5.toValue(value_0.value)));
  }
}

const _descriptor_6 = new _CoinInfo_0();

class _Escrow_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment())))));
  }
  fromValue(value_0) {
    return {
      org: _descriptor_1.fromValue(value_0),
      contributor: _descriptor_2.fromValue(value_0),
      fee_address: _descriptor_2.fromValue(value_0),
      fee: _descriptor_3.fromValue(value_0),
      state: _descriptor_4.fromValue(value_0),
      coin: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.org).concat(_descriptor_2.toValue(value_0.contributor).concat(_descriptor_2.toValue(value_0.fee_address).concat(_descriptor_3.toValue(value_0.fee).concat(_descriptor_4.toValue(value_0.state).concat(_descriptor_6.toValue(value_0.coin))))));
  }
}

const _descriptor_7 = new _Escrow_0();

const _descriptor_8 = new __compactRuntime.CompactTypeBoolean();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_9 = new _ContractAddress_0();

class _Either_0 {
  alignment() {
    return _descriptor_8.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_8.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_8.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_9.toValue(value_0.right)));
  }
}

const _descriptor_10 = new _Either_0();

class _QualifiedCoinInfo_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment().concat(_descriptor_3.alignment())));
  }
  fromValue(value_0) {
    return {
      nonce: _descriptor_1.fromValue(value_0),
      color: _descriptor_1.fromValue(value_0),
      value: _descriptor_5.fromValue(value_0),
      mt_index: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.nonce).concat(_descriptor_1.toValue(value_0.color).concat(_descriptor_5.toValue(value_0.value).concat(_descriptor_3.toValue(value_0.mt_index))));
  }
}

const _descriptor_11 = new _QualifiedCoinInfo_0();

class _Maybe_0 {
  alignment() {
    return _descriptor_8.alignment().concat(_descriptor_6.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_8.fromValue(value_0),
      value: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_8.toValue(value_0.is_some).concat(_descriptor_6.toValue(value_0.value));
  }
}

const _descriptor_12 = new _Maybe_0();

class _SendResult_0 {
  alignment() {
    return _descriptor_12.alignment().concat(_descriptor_6.alignment());
  }
  fromValue(value_0) {
    return {
      change: _descriptor_12.fromValue(value_0),
      sent: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_12.toValue(value_0.change).concat(_descriptor_6.toValue(value_0.sent));
  }
}

const _descriptor_13 = new _SendResult_0();

const _descriptor_14 = new __compactRuntime.CompactTypeField();

const _descriptor_15 = new __compactRuntime.CompactTypeBytes(6);

class _CoinPreimage_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_8.alignment().concat(_descriptor_1.alignment().concat(_descriptor_15.alignment())));
  }
  fromValue(value_0) {
    return {
      info: _descriptor_6.fromValue(value_0),
      dataType: _descriptor_8.fromValue(value_0),
      data: _descriptor_1.fromValue(value_0),
      domain_sep: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.info).concat(_descriptor_8.toValue(value_0.dataType).concat(_descriptor_1.toValue(value_0.data).concat(_descriptor_15.toValue(value_0.domain_sep))));
  }
}

const _descriptor_16 = new _CoinPreimage_0();

const _descriptor_17 = new __compactRuntime.CompactTypeVector(2, _descriptor_14);

const _descriptor_18 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_19 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1)
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    this.witnesses = witnesses_0;
    this.circuits = {
      create: (...args_1) => {
        if (args_1.length !== 6)
          throw new __compactRuntime.CompactError(`create: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const contributor_0 = args_1[1];
        const fee_address_0 = args_1[2];
        const org_0 = args_1[3];
        const fee_0 = args_1[4];
        const coin_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('create',
                                      'argument 1 (as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(typeof(contributor_0) === 'object' && contributor_0.bytes.buffer instanceof ArrayBuffer && contributor_0.bytes.BYTES_PER_ELEMENT === 1 && contributor_0.bytes.length === 32))
          __compactRuntime.type_error('create',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      contributor_0)
        if (!(typeof(fee_address_0) === 'object' && fee_address_0.bytes.buffer instanceof ArrayBuffer && fee_address_0.bytes.BYTES_PER_ELEMENT === 1 && fee_address_0.bytes.length === 32))
          __compactRuntime.type_error('create',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'struct ZswapCoinPublicKey<bytes: Bytes<32>>',
                                      fee_address_0)
        if (!(org_0.buffer instanceof ArrayBuffer && org_0.BYTES_PER_ELEMENT === 1 && org_0.length === 32))
          __compactRuntime.type_error('create',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'Bytes<32>',
                                      org_0)
        if (!(typeof(fee_0) === 'bigint' && fee_0 >= 0 && fee_0 <= 18446744073709551615n))
          __compactRuntime.type_error('create',
                                      'argument 4 (argument 5 as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'Uint<0..18446744073709551615>',
                                      fee_0)
        if (!(typeof(coin_0) === 'object' && coin_0.nonce.buffer instanceof ArrayBuffer && coin_0.nonce.BYTES_PER_ELEMENT === 1 && coin_0.nonce.length === 32 && coin_0.color.buffer instanceof ArrayBuffer && coin_0.color.BYTES_PER_ELEMENT === 1 && coin_0.color.length === 32 && typeof(coin_0.value) === 'bigint' && coin_0.value >= 0 && coin_0.value <= 340282366920938463463374607431768211455n))
          __compactRuntime.type_error('create',
                                      'argument 5 (argument 6 as invoked from Typescript)',
                                      'escrow.compact line 24 char 1',
                                      'struct CoinInfo<nonce: Bytes<32>, color: Bytes<32>, value: Uint<0..340282366920938463463374607431768211455>>',
                                      coin_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(contributor_0).concat(_descriptor_2.toValue(fee_address_0).concat(_descriptor_1.toValue(org_0).concat(_descriptor_3.toValue(fee_0).concat(_descriptor_6.toValue(coin_0))))),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_6.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_create_0(context,
                                         partialProofData,
                                         contributor_0,
                                         fee_address_0,
                                         org_0,
                                         fee_0,
                                         coin_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      release: (...args_1) => {
        if (args_1.length !== 2)
          throw new __compactRuntime.CompactError(`release: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('release',
                                      'argument 1 (as invoked from Typescript)',
                                      'escrow.compact line 47 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0 && id_0 <= 4294967295n))
          __compactRuntime.type_error('release',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'escrow.compact line 47 char 1',
                                      'Uint<0..4294967295>',
                                      id_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_release_0(context, partialProofData, id_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      create: this.circuits.create,
      release: this.circuits.release
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1)
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('create', new __compactRuntime.ContractOperation());
    state_0.setOperation('release', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(0n),
                                                                            alignment: _descriptor_19.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(1n),
                                                                            alignment: _descriptor_19.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(2n),
                                                                            alignment: _descriptor_19.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                            alignment: _descriptor_3.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(2n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_18.toValue(tmp_0),
                                              alignment: _descriptor_18.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  #_some_0(context, partialProofData, value_0) {
    return { is_some: true, value: value_0 };
  }
  #_none_0(context, partialProofData) {
    return { is_some: false,
             value:
               { nonce: new Uint8Array(32), color: new Uint8Array(32), value: 0n } };
  }
  #_right_0(context, partialProofData, value_0) {
    return { is_left: false, left: { bytes: new Uint8Array(32) }, right: value_0 };
  }
  #_transientHash_0(context, partialProofData, value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_17, value_0);
    return result_0;
  }
  #_persistentHash_0(context, partialProofData, value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_16, value_0);
    return result_0;
  }
  #_degradeToTransient_0(context, partialProofData, x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  #_upgradeFromTransient_0(context, partialProofData, x_0) {
    const result_0 = __compactRuntime.upgradeFromTransient(x_0);
    return result_0;
  }
  #_createZswapInput_0(context, partialProofData, coin_0) {
    const result_0 = __compactRuntime.createZswapInput(context, coin_0);
    partialProofData.privateTranscriptOutputs.push({
      value: [],
      alignment: []
    });
    return result_0;
  }
  #_createZswapOutput_0(context, partialProofData, coin_0, recipient_0) {
    const result_0 = __compactRuntime.createZswapOutput(context,
                                                        coin_0,
                                                        recipient_0);
    partialProofData.privateTranscriptOutputs.push({
      value: [],
      alignment: []
    });
    return result_0;
  }
  #_receive_0(context, partialProofData, coin_0) {
    const recipient_0 = this.#_right_0(context,
                                       partialProofData,
                                       _descriptor_9.fromValue(Contract._query(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 2 } },
                                                                                { idx: { cached: true,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_19.toValue(0n),
                                                                                                           alignment: _descriptor_19.alignment() } }] } },
                                                                                { popeq: { cached: true,
                                                                                           result: undefined } }]).value));
    this.#_createZswapOutput_0(context, partialProofData, coin_0, recipient_0);
    const tmp_0 = this.#_coinCommitment_0(context,
                                          partialProofData,
                                          coin_0,
                                          recipient_0);
    Contract._query(context,
                    partialProofData,
                    [
                     { swap: { n: 0 } },
                     { idx: { cached: true,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(1n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newNull().encode() } },
                     { ins: { cached: true, n: 2 } },
                     { swap: { n: 0 } }]);
    return [];
  }
  #_send_0(context, partialProofData, input_0, recipient_0, value_0) {
    const selfAddr_0 = _descriptor_9.fromValue(Contract._query(context,
                                                               partialProofData,
                                                               [
                                                                { dup: { n: 2 } },
                                                                { idx: { cached: true,
                                                                         pushPath: false,
                                                                         path: [
                                                                                { tag: 'value',
                                                                                  value: { value: _descriptor_19.toValue(0n),
                                                                                           alignment: _descriptor_19.alignment() } }] } },
                                                                { popeq: { cached: true,
                                                                           result: undefined } }]).value);
    this.#_createZswapInput_0(context, partialProofData, input_0);
    const tmp_0 = this.#_coinNullifier_0(context,
                                         partialProofData,
                                         this.#_downcastQualifiedCoin_0(context,
                                                                        partialProofData,
                                                                        input_0),
                                         selfAddr_0);
    Contract._query(context,
                    partialProofData,
                    [
                     { swap: { n: 0 } },
                     { idx: { cached: true,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(0n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newNull().encode() } },
                     { ins: { cached: true, n: 2 } },
                     { swap: { n: 0 } }]);
    let t_0;
    const change_0 = (t_0 = input_0.value,
                      (__compactRuntime.assert(!(t_0 < value_0),
                                               'result of subtraction would be negative'),
                       t_0 - value_0));
    const output_0 = { nonce:
                         this.#_upgradeFromTransient_0(context,
                                                       partialProofData,
                                                       this.#_transientHash_0(context,
                                                                              partialProofData,
                                                                              [__compactRuntime.convert_Uint8Array_to_bigint(28,
                                                                                                                             new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101])),
                                                                               this.#_degradeToTransient_0(context,
                                                                                                           partialProofData,
                                                                                                           input_0.nonce)])),
                       color: input_0.color,
                       value: value_0 };
    this.#_createZswapOutput_0(context, partialProofData, output_0, recipient_0);
    const tmp_1 = this.#_coinCommitment_0(context,
                                          partialProofData,
                                          output_0,
                                          recipient_0);
    Contract._query(context,
                    partialProofData,
                    [
                     { swap: { n: 0 } },
                     { idx: { cached: true,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(2n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newNull().encode() } },
                     { ins: { cached: true, n: 2 } },
                     { swap: { n: 0 } }]);
    if (this.#_equal_0(change_0, 0n)) {
      return { change: this.#_none_0(context, partialProofData), sent: output_0 };
    } else {
      const changeCoin_0 = { nonce:
                               this.#_upgradeFromTransient_0(context,
                                                             partialProofData,
                                                             this.#_transientHash_0(context,
                                                                                    partialProofData,
                                                                                    [__compactRuntime.convert_Uint8Array_to_bigint(30,
                                                                                                                                   new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101, 47, 50])),
                                                                                     this.#_degradeToTransient_0(context,
                                                                                                                 partialProofData,
                                                                                                                 input_0.nonce)])),
                             color: input_0.color,
                             value: change_0 };
      this.#_createZswapOutput_0(context,
                                 partialProofData,
                                 changeCoin_0,
                                 this.#_right_0(context,
                                                partialProofData,
                                                selfAddr_0));
      const cm_0 = this.#_coinCommitment_0(context,
                                           partialProofData,
                                           changeCoin_0,
                                           this.#_right_0(context,
                                                          partialProofData,
                                                          selfAddr_0));
      Contract._query(context,
                      partialProofData,
                      [
                       { swap: { n: 0 } },
                       { idx: { cached: true,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_19.toValue(2n),
                                                  alignment: _descriptor_19.alignment() } }] } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(cm_0),
                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newNull().encode() } },
                       { ins: { cached: true, n: 2 } },
                       { swap: { n: 0 } }]);
      Contract._query(context,
                      partialProofData,
                      [
                       { swap: { n: 0 } },
                       { idx: { cached: true,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_19.toValue(1n),
                                                  alignment: _descriptor_19.alignment() } }] } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(cm_0),
                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newNull().encode() } },
                       { ins: { cached: true, n: 2 } },
                       { swap: { n: 0 } }]);
      return { change: this.#_some_0(context, partialProofData, changeCoin_0),
               sent: output_0 };
    }
  }
  #_sendImmediate_0(context, partialProofData, input_0, target_0, value_0) {
    return this.#_send_0(context,
                         partialProofData,
                         this.#_upcastQualifiedCoin_0(context,
                                                      partialProofData,
                                                      input_0),
                         target_0,
                         value_0);
  }
  #_downcastQualifiedCoin_0(context, partialProofData, coin_0) {
    return { nonce: coin_0.nonce, color: coin_0.color, value: coin_0.value };
  }
  #_upcastQualifiedCoin_0(context, partialProofData, coin_0) {
    return { nonce: coin_0.nonce,
             color: coin_0.color,
             value: coin_0.value,
             mt_index: 0n };
  }
  #_coinCommitment_0(context, partialProofData, coin_0, recipient_0) {
    return this.#_persistentHash_0(context,
                                   partialProofData,
                                   { info: coin_0,
                                     dataType: recipient_0.is_left,
                                     data:
                                       recipient_0.is_left ?
                                       recipient_0.left.bytes :
                                       recipient_0.right.bytes,
                                     domain_sep:
                                       new Uint8Array([109, 100, 110, 58, 99, 99]) });
  }
  #_coinNullifier_0(context, partialProofData, coin_0, addr_0) {
    return this.#_persistentHash_0(context,
                                   partialProofData,
                                   { info: coin_0,
                                     dataType: false,
                                     data: addr_0.bytes,
                                     domain_sep:
                                       new Uint8Array([109, 100, 110, 58, 99, 110]) });
  }
  #_create_0(context,
             partialProofData,
             contributor_0,
             fee_address_0,
             org_0,
             fee_0,
             coin_0)
  {
    this.#_receive_0(context, partialProofData, coin_0);
    const tmp_0 = ((t1) => {
                    if (t1 > 4294967295n)
                      throw new __compactRuntime.CompactError('escrow.compact line 32 char 22: cast from unsigned value to smaller unsigned value failed: ' + t1 + ' is greater than 4294967295');
                    return t1;
                  })(_descriptor_0.fromValue(Contract._query(context,
                                                             partialProofData,
                                                             [
                                                              { dup: { n: 0 } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_19.toValue(0n),
                                                                                         alignment: _descriptor_19.alignment() } }] } },
                                                              { popeq: { cached: false,
                                                                         result: undefined } }]).value)
                     +
                     1n);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(0n),
                                                                            alignment: _descriptor_19.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_1 = _descriptor_0.fromValue(Contract._query(context,
                                                          partialProofData,
                                                          [
                                                           { dup: { n: 0 } },
                                                           { idx: { cached: false,
                                                                    pushPath: false,
                                                                    path: [
                                                                           { tag: 'value',
                                                                             value: { value: _descriptor_19.toValue(0n),
                                                                                      alignment: _descriptor_19.alignment() } }] } },
                                                           { popeq: { cached: false,
                                                                      result: undefined } }]).value);
    const tmp_2 = { org: org_0,
                    contributor: contributor_0,
                    fee_address: fee_address_0,
                    fee: fee_0,
                    state: 0,
                    coin: coin_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(1n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_2),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return _descriptor_0.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_19.toValue(0n),
                                                                               alignment: _descriptor_19.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  #_release_0(context, partialProofData, id_0) {
    const e_0 = _descriptor_7.fromValue(Contract._query(context,
                                                        partialProofData,
                                                        [
                                                         { dup: { n: 0 } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_19.toValue(1n),
                                                                                    alignment: _descriptor_19.alignment() } }] } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_0.toValue(id_0),
                                                                                    alignment: _descriptor_0.alignment() } }] } },
                                                         { popeq: { cached: false,
                                                                    result: undefined } }]).value);
    __compactRuntime.assert(e_0.state === 0, 'Escrow not active');
    const recipient_0 = { is_left: true,
                          left: e_0.contributor,
                          right: { bytes: new Uint8Array(32) } };
    const result_0 = this.#_sendImmediate_0(context,
                                            partialProofData,
                                            e_0.coin,
                                            recipient_0,
                                            e_0.coin.value);
    const updated_0 = { org: e_0.org,
                        contributor: e_0.contributor,
                        fee_address: e_0.fee_address,
                        fee: e_0.fee,
                        state: 1,
                        coin: e_0.coin };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_19.toValue(1n),
                                                alignment: _descriptor_19.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(updated_0),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  #_equal_0(x0, y0) {
    if (x0 !== y0) return false;
    return true;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get last_escrow_id() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_19.toValue(0n),
                                                                                 alignment: _descriptor_19.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    escrows: {
      isEmpty(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_8.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_19.toValue(1n),
                                                                                   alignment: _descriptor_19.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_19.toValue(1n),
                                                                                   alignment: _descriptor_19.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0 && key_0 <= 4294967295n))
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'escrow.compact line 15 char 1',
                                      'Uint<0..4294967295>',
                                      key_0)
        return _descriptor_8.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_19.toValue(1n),
                                                                                   alignment: _descriptor_19.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0 && key_0 <= 4294967295n))
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'escrow.compact line 15 char 1',
                                      'Uint<0..4294967295>',
                                      key_0)
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_19.toValue(1n),
                                                                                   alignment: _descriptor_19.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get instance() {
      return _descriptor_3.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_19.toValue(2n),
                                                                                 alignment: _descriptor_19.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = { };
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
