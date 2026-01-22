import { query, queryOne, execute } from '../config/database';
import { Asset } from './types';
import { v4 as uuid } from 'uuid';

export async function createAsset(data: {
  type: 'character' | 'enemy' | 'background' | 'effect' | 'ui';
  name: string;
  url: string;
  cloudinary_id: string;
  phase?: number;
  tags?: string[];
}): Promise<Asset> {
  const id = uuid();
  const result = await queryOne<Asset>(`
    INSERT INTO assets (id, type, name, url, cloudinary_id, phase, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [id, data.type, data.name, data.url, data.cloudinary_id, data.phase, data.tags || []]);
  return result!;
}

export async function getAssetsByType(type: string, phase?: number): Promise<Asset[]> {
  if (phase !== undefined) {
    return query<Asset>(`
      SELECT * FROM assets 
      WHERE type = $1 AND (phase = $2 OR phase IS NULL) AND is_active = true
      ORDER BY version DESC
    `, [type, phase]);
  }
  return query<Asset>(`
    SELECT * FROM assets 
    WHERE type = $1 AND is_active = true
    ORDER BY version DESC
  `, [type]);
}

export async function getActiveAssets(): Promise<Asset[]> {
  return query<Asset>('SELECT * FROM assets WHERE is_active = true ORDER BY type, name');
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.url !== undefined) { updates.push(`url = $${idx++}`); values.push(data.url); }
  if (data.is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(data.is_active); }
  if (data.version !== undefined) { updates.push(`version = $${idx++}`); values.push(data.version); }
  if (data.tags !== undefined) { updates.push(`tags = $${idx++}`); values.push(data.tags); }

  if (updates.length > 0) {
    values.push(id);
    await execute(`UPDATE assets SET ${updates.join(', ')} WHERE id = $${idx}`, values);
  }
}

export async function deactivateAsset(id: string): Promise<void> {
  await execute('UPDATE assets SET is_active = false WHERE id = $1', [id]);
}
