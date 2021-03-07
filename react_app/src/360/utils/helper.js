export const getVarcharEight = () =>
  Array.apply(0, Array(8))
    .map(() =>
      ((charset) => charset.charAt(Math.floor(Math.random() * charset.length)))(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      )
    )
    .join('');