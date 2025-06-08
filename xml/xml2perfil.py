import sys
import xml.etree.ElementTree as ET

def crear_svg(altitudes, archivo_salida):
    # Parámetros básicos del SVG
    ancho = 500
    alto = 200
    margen = 20
    
    if not altitudes:
        print("No hay altitudes para dibujar.")
        return
    
    # Normalizar altitudes para que encajen en alto
    alt_min = min(altitudes)
    alt_max = max(altitudes)
    rango_alt = alt_max - alt_min if alt_max != alt_min else 1
    
    n = len(altitudes)
    # Espacio horizontal entre puntos
    paso_x = (ancho - 2 * margen) / (n - 1) if n > 1 else 0
    
    puntos_svg = []
    for i, alt in enumerate(altitudes):
        x = margen + i * paso_x
        # invertimos verticalmente (0 arriba), y normalizamos
        y = margen + (1 - (alt - alt_min) / rango_alt) * (alto - 2 * margen)
        puntos_svg.append(f"{x},{y}")
    
    # Para cerrar la polilínea hacia el "suelo"
    # Añadimos puntos en la base del SVG (altura máxima)
    puntos_svg.append(f"{margen + (n -1)*paso_x},{alto - margen}")
    puntos_svg.append(f"{margen},{alto - margen}")
    puntos_svg.append(puntos_svg[0])  # cerrar polilínea
    
    puntos_str = " ".join(puntos_svg)
    
    contenido_svg = f'''<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <polyline points="{puntos_str}" fill="lightblue" stroke="blue" stroke-width="2"/>
</svg>'''
    
    with open(archivo_salida, "w", encoding="utf-8") as f:
        f.write(contenido_svg)
    print(f"SVG creado en '{archivo_salida}'")

def extraer_altimetria(xml_file, ruta_id):
    ns = {'uniovi': 'http://uniovi.es'}
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    ruta = root.find(f".//uniovi:ruta[@id='{ruta_id}']", namespaces=ns)
    if ruta is None:
        print(f"No se encontró la ruta con id={ruta_id}")
        return None
    
    altitudes = []
    # Extraer altitud de cada hito
    for hito in ruta.findall(".//uniovi:hito", namespaces=ns):
        alt = hito.find(".//uniovi:coordenadas/uniovi:altitud", namespaces=ns)
        if alt is not None and alt.text is not None:
            try:
                altitudes.append(float(alt.text))
            except ValueError:
                pass
    return altitudes

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python xml2perfil.py <archivo.xml> <id_ruta> <archivo_salida.svg>")
        sys.exit(1)
    
    archivo_xml = sys.argv[1]
    id_ruta = sys.argv[2]
    archivo_svg = sys.argv[3]
    
    altitudes = extraer_altimetria(archivo_xml, id_ruta)
    if altitudes:
        crear_svg(altitudes, archivo_svg)