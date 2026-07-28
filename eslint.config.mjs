import next from 'eslint-config-next'

/** eslint-config-next 16 ya se exporta como array flat: no hace falta FlatCompat. */
const config = [{ ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] }, ...next]

export default config
