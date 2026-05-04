const stringifyValue = (value) => (value == null || value === '' ? '' : String(value))

export function buildSashSavePayload({ form, itgEstiNo, wEstiNo, estiNos = '1', editEstiSeq = '' }) {
  return {
    itgEstiNo,
    estiNo: wEstiNo,
    estiNos,
    estiSeq: editEstiSeq || '',

    mdlCd: form.mdlCd,
    wintydiCd: form.wintydiCd,
    bftydiCd: form.bftydiCd,
    sizCd: form.sizCd,
    bsmfOrdUtmCd: form.bsmfOrdUtmCd,
    sashOrdTypCd: form.sashOrdTypCd,

    w0Size: stringifyValue(form.w),
    h0Size: stringifyValue(form.h),
    qty: stringifyValue(form.qty),
    w1Size: stringifyValue(form.w1),
    w2Size: stringifyValue(form.w2),
    w3Size: stringifyValue(form.w3),
    w4Size: stringifyValue(form.w4),
    w5Size: stringifyValue(form.w5),
    h1Size: stringifyValue(form.h1),
    h2Size: stringifyValue(form.h2),
    h3Size: stringifyValue(form.h3),
    h4Size: stringifyValue(form.h4),
    h5Size: stringifyValue(form.h5),
    csSize: stringifyValue(form.cs),
    cs1Size: stringifyValue(form.cs1),
    cs2Size: stringifyValue(form.cs2),
    cs3Size: stringifyValue(form.cs3),
    cs4Size: stringifyValue(form.cs4),
    cs5Size: stringifyValue(form.cs5),

    crtnColrCd: 'WH',
    insdColrCd: form.insdColrCd,
    ousdColrCd: form.ousdColrCd || form.insdColrCd,

    insdSf: form.insdSf,
    ousdSf: form.ousdSf,
    ventLoc: form.ventLoc || '',
    screenType: form.screenType,
    aluMfYn: form.isAluMf ? 'Y' : 'N',
    bfSlcnFnshYn: form.slcnFnshYn ? 'Y' : 'N',

    insdHandleType: form.insdHandleType,
    ousdHandleType: form.ousdHandleType,
    insdHndlH: stringifyValue(form.insdHndlH),
    ousdHndlH: stringifyValue(form.ousdHndlH),

    mtrlCds1: stringifyValue(form.mtrlCds1),
    mtrlCds2: stringifyValue(form.mtrlCds2),
    mtrlCds3: stringifyValue(form.mtrlCds3),
    mtrlCds4: stringifyValue(form.mtrlCds4),

    remSrc: form.remSrc,
  }
}
