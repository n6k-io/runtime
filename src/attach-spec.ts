// One ATTACHed catalog: which endpoint serves it, and its name there. The alias
// it is ATTACHed as is the key this sits under. Mirrors the FT_HELLO frame — the
// endpoint picks the data.py namespace, `catalog` picks the Database in it.
export type AttachSpec = { slug: string; catalog: string };
