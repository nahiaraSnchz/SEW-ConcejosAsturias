import xml.etree.ElementTree as ET
import argparse

class Kml(object):

    def __init__(self):
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz,'Document')

    def addPlacemark(self, nombre, descripcion, lon, lat, alt, modoAltitud="absolute"):
        pm = ET.SubElement(self.doc,'Placemark')
        ET.SubElement(pm,'name').text = nombre
        ET.SubElement(pm,'description').text = descripcion
        punto = ET.SubElement(pm,'Point')
        ET.SubElement(punto,'coordinates').text = f"{lon},{lat},{alt}"
        ET.SubElement(punto,'altitudeMode').text = modoAltitud

    def addStyleLine(self, style_id, color="ff0000ff", ancho="3"):
        estilo = ET.SubElement(self.doc, 'Style', id=style_id)
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = color
        ET.SubElement(linea, 'width').text = ancho

    def addLineString(self, nombre, extrude, tessellate, listaCoordenadas, modoAltitud="absolute", style_id=None):
        pm = ET.SubElement(self.doc,'Placemark')
        ET.SubElement(pm,'name').text = nombre
        if style_id:
            ET.SubElement(pm, 'styleUrl').text = f"#{style_id}"
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls,'extrude').text = extrude
        ET.SubElement(ls,'tessellate').text = tessellate
        ET.SubElement(ls,'coordinates').text = listaCoordenadas


    def escribir(self, nombreArchivoKML):
        arbol = ET.ElementTree(self.raiz)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)


def extraer_hitos_de_ruta(archivoXML, id):
    try:
        arbol = ET.parse(archivoXML)
        raiz = arbol.getroot()
    except Exception as e:
        print("Error leyendo XML:", e)
        return []

    ns = {'ns': 'http://uniovi.es'}  # Definimos el namespace con un alias

    rutas = raiz.findall('ns:ruta', ns)
    ruta = None
    for r in rutas:
        if r.get('id') == id:
            ruta = r
            break

    if ruta is None:
        print(f"No se encontró la ruta con id '{id}' en el XML.")
        return []

    hitos = []
    for hito in ruta.findall('ns:hitos/ns:hito', ns):
        coord = hito.find('ns:coordenadas', ns)
        if coord is None:
            print("Hito sin coordenada, se omite.")
            continue

        lat = coord.find('ns:latitud', ns)
        lon = coord.find('ns:longitud', ns)
        alt = coord.find('ns:altitud', ns)

        if lat is not None and lon is not None and alt is not None:
            try:
                latitud = float(lat.text)
                longitud = float(lon.text)
                altura = float(alt.text)
                hitos.append((latitud, longitud, altura))
            except ValueError:
                print("Coordenadas mal formadas en un hito, se omite.")
        else:
            print("Faltan datos en un hito, se omite.")

    return hitos

def generar_kml_desde_xml(archivoXML, id, nombreArchivoSalida):
    hitos = extraer_hitos_de_ruta(archivoXML, id)
    if not hitos:
        print("No hay hitos para generar el KML.")
        return

    nuevoKML = Kml()

    # Añadimos un placemark por cada hito
    for i, (lat, lon, alt) in enumerate(hitos, 1):
        nuevoKML.addPlacemark(f"Hito {i}", f"Hito número {i}", lon, lat, alt)

    # Creamos la cadena de coordenadas para LineString
    listaCoordenadas = "\n".join(f"{lon},{lat},{alt}" for lat, lon, alt in hitos)

    # Añadir estilo a  la linea
    nuevoKML.addStyleLine("lineaVerde", color="ff00ff00", ancho="4")

    # Añadimos la línea que une todos los hitos
    nuevoKML.addLineString("Ruta Completa", "1", "1", listaCoordenadas, style_id="lineaVerde")

    # Guardamos el archivo KML
    nuevoKML.escribir(nombreArchivoSalida)
    print(f"Archivo KML creado: {nombreArchivoSalida}")


def main():
    parser = argparse.ArgumentParser(description="Generar KML de ruta a partir de XML")
    parser.add_argument("archivoXML", help="Archivo XML de entrada con rutas")
    parser.add_argument("id", help="Id de la ruta a generar")
    parser.add_argument("archivoKML", help="Archivo KML de salida")
    args = parser.parse_args()

    generar_kml_desde_xml(args.archivoXML, args.id, args.archivoKML)

if __name__ == "__main__":
    main()