"""
Script para subir la misma foto y huella a todos los trabajadores.
Ejecutar: python seed_fotos.py
"""
import os, httpx, struct, zlib, math
from uuid import uuid4
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
BUCKET = "documentos-pdfs"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Foto unica para todos los trabajadores
FOTO_URL = "https://randomuser.me/api/portraits/men/32.jpg"

def generar_huella_png(size=200) -> bytes:
    cx, cy = size // 2, size // 2
    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            angle = math.atan2(dy, dx)
            val = int(128 + 100 * math.sin(dist * 0.5 + angle * 2))
            val = 255 if dist > cx - 5 else max(0, min(255, val))
            row.append(val)
        pixels.append(row)
    raw = b''.join(b'\x00' + bytes(r) for r in pixels)
    compressed = zlib.compress(raw)
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 0, 0, 0, 0))
            + chunk(b'IDAT', compressed)
            + chunk(b'IEND', b''))

def upload_doc(trabajador_id, file_bytes, filename, content_type, tipo):
    path = f"{trabajador_id}/{uuid4()}.{filename.rsplit('.',1)[-1]}"
    sb.storage.from_(BUCKET).upload(path, file_bytes, {"content-type": content_type})
    url = sb.storage.from_(BUCKET).get_public_url(path)
    sb.table("documentos").insert({
        "trabajador_id": trabajador_id,
        "nombre_archivo": filename,
        "tipo_documento": tipo,
        "url_storage": url,
        "tamano_bytes": len(file_bytes),
    }).execute()

def main():
    workers = sb.table("trabajadores").select("id,codigo,nombres").order("codigo").execute().data
    print(f"Trabajadores: {len(workers)}")

    print("Descargando foto...")
    foto_bytes = httpx.get(FOTO_URL, headers=HEADERS, follow_redirects=True, timeout=15).content
    print(f"Foto OK ({len(foto_bytes)} bytes)")

    print("Generando huella...")
    huella_bytes = generar_huella_png()
    print(f"Huella OK ({len(huella_bytes)} bytes)\n")

    for i, w in enumerate(workers):
        codigo = w.get("codigo", "")
        nombre = w.get("nombres", "")
        print(f"[{i+1}/{len(workers)}] {codigo} {nombre}")

        docs = sb.table("documentos").select("tipo_documento").eq("trabajador_id", w["id"]).execute().data
        tipos = {d["tipo_documento"] for d in docs}

        if "Foto" not in tipos:
            upload_doc(w["id"], foto_bytes, f"foto_{codigo}.jpg", "image/jpeg", "Foto")
            print("  Foto subida")
        else:
            print("  Foto ya existe")

        if "Huella" not in tipos:
            upload_doc(w["id"], huella_bytes, f"huella_{codigo}.png", "image/png", "Huella")
            print("  Huella subida")
        else:
            print("  Huella ya existe")

    print("\nProceso completado!")

if __name__ == "__main__":
    main()
