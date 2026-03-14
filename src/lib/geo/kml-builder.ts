import type { MatriculaData } from "@/lib/types/matricula";
import type { GeoJSONPolygon } from "@/lib/types/geo";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildDescriptionHtml(matricula: MatriculaData): string {
  const { registro, endereco, areas, dimensoes, fiscal, onus, status } = matricula;

  const onusAtivos = onus.filter((o) => o.ativo);

  let html = `
<h3>Matrícula ${escapeXml(registro.numeroMatricula)}</h3>
<p><b>Cartório:</b> ${escapeXml(registro.cartorio.nome)} (${registro.cartorio.numero}º)</p>
<p><b>Endereço:</b> ${escapeXml(endereco.enderecoCompleto)}</p>
<hr/>
<table style="border-collapse:collapse;font-size:12px;">
  <tr><td style="padding:2px 8px;"><b>Área Terreno:</b></td><td>${areas.terreno.metrosQuadrados.toFixed(2)} m²</td></tr>
  <tr><td style="padding:2px 8px;"><b>Área Construída:</b></td><td>${areas.construida.liquida.toFixed(2)} m²</td></tr>`;

  if (areas.app) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Área APP:</b></td><td>${areas.app.metrosQuadrados.toFixed(2)} m²</td></tr>`;
  }

  if (dimensoes.testada) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Testada:</b></td><td>${dimensoes.testada.metros.toFixed(2)} m</td></tr>`;
  }
  if (dimensoes.fundos) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Fundos:</b></td><td>${dimensoes.fundos.metros.toFixed(2)} m</td></tr>`;
  }
  if (dimensoes.lateralDireita) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Lateral Dir.:</b></td><td>${dimensoes.lateralDireita.metros.toFixed(2)} m</td></tr>`;
  }
  if (dimensoes.lateralEsquerda) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Lateral Esq.:</b></td><td>${dimensoes.lateralEsquerda.metros.toFixed(2)} m</td></tr>`;
  }

  if (areas.privativa) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Área Privativa:</b></td><td>${areas.privativa.metrosQuadrados.toFixed(2)} m²</td></tr>`;
  }
  if (areas.comum) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Área Comum:</b></td><td>${areas.comum.metrosQuadrados.toFixed(2)} m²</td></tr>`;
  }

  if (fiscal.iptu) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>IPTU:</b></td><td>${escapeXml(fiscal.iptu)}</td></tr>`;
  }
  if (fiscal.inscricaoCadastral) {
    html += `\n  <tr><td style="padding:2px 8px;"><b>Inscrição:</b></td><td>${escapeXml(fiscal.inscricaoCadastral)}</td></tr>`;
  }

  html += `\n</table>`;

  if (status.encerrada) {
    html += `\n<hr/>\n<p style="color:orange;font-weight:bold;">MATRÍCULA ENCERRADA${status.motivoEncerramento ? `: ${escapeXml(status.motivoEncerramento)}` : ""}</p>`;
  }

  if (onusAtivos.length > 0) {
    html += `\n<hr/>\n<h4 style="color:red;">⚠ Ônus Ativos</h4>\n<ul>`;
    for (const o of onusAtivos) {
      html += `\n<li><b>${escapeXml(o.tipo)}:</b> ${escapeXml(o.descricao)}${o.beneficiario ? ` (${escapeXml(o.beneficiario)})` : ""}</li>`;
    }
    html += `\n</ul>`;
  }

  return html;
}

export function buildKml(
  matricula: MatriculaData,
  polygon: GeoJSONPolygon | null,
  center: { lat: number; lng: number }
): string {
  const description = buildDescriptionHtml(matricula);
  const name = `Matrícula ${matricula.registro.numeroMatricula}`;

  let geometryKml: string;

  if (polygon && polygon.geometry.coordinates[0].length > 0) {
    const coordsStr = polygon.geometry.coordinates[0]
      .map(([lng, lat]) => `${lng},${lat},0`)
      .join("\n              ");

    geometryKml = `
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${coordsStr}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>`;
  } else {
    geometryKml = `
      <Point>
        <coordinates>${center.lng},${center.lat},0</coordinates>
      </Point>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(name)}</name>

    <Style id="propertyStyle">
      <PolyStyle>
        <color>7f0000ff</color>
        <outline>1</outline>
      </PolyStyle>
      <LineStyle>
        <color>ff0000ff</color>
        <width>2</width>
      </LineStyle>
      <IconStyle>
        <color>ff0000ff</color>
      </IconStyle>
    </Style>

    <Placemark>
      <name>${escapeXml(name)}</name>
      <description><![CDATA[${description}]]></description>
      <styleUrl>#propertyStyle</styleUrl>
      ${geometryKml}
    </Placemark>
  </Document>
</kml>`;
}
