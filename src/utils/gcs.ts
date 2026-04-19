import { bucket } from '../config/storage';

/** 1 hora de validade padrão para URLs assinadas. */
const DEFAULT_EXPIRATION_MS = 60 * 60 * 1000;

/**
 * Gera URL assinada de leitura para um caminho `gs://...` ou chave relativa
 * dentro do bucket. Retorna null quando a entrada for vazia.
 */
export async function generateSignedUrl(
  gcsPath: string | null | undefined,
  expirationMs: number = DEFAULT_EXPIRATION_MS,
): Promise<string | null> {
  if (!gcsPath) return null;

  const prefix = `gs://${bucket.name}/`;
  const filePath = gcsPath.startsWith(prefix) ? gcsPath.slice(prefix.length) : gcsPath;

  const [url] = await bucket.file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + expirationMs,
  });
  return url;
}
