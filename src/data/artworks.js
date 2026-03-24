// Generate a gradient SVG placeholder for each artwork
function placeholder(id) {
  const gradients = [
    ['#2E4036','#4A7A5A'], ['#5C3A2E','#9B6B50'], ['#2A3545','#4A6585'],
    ['#3D2E4A','#6B5A7A'], ['#1E2E20','#3A5A3E'], ['#4A3520','#8A6A40'],
    ['#2E2A3D','#5A5080'], ['#1A2E35','#3A6070'], ['#3A2A1E','#7A5A40'],
    ['#2A1E35','#5A4A6A'], ['#1E3530','#3A6A60'], ['#352A1E','#6A5040'],
    ['#2E3520','#5A6A40'], ['#1E2A35','#3A5070'], ['#35201E','#6A4040'],
  ]
  const [c1, c2] = gradients[id % gradients.length]
  const num = String(id + 1).padStart(2, '0')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="530"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="530" fill="url(#g)"/><text x="200" y="290" fill="rgba(255,255,255,0.1)" text-anchor="middle" font-size="160" font-family="monospace" font-weight="bold">${num}</text></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

const raw = [
  { titles: ["A quarta morada", "Trompe l'oeil", "Imanência e transcendência"], side: "Direito", location: "Atelie", year: 2025 },
  { titles: ["Sinédoque", "Uma visão que bata nas turbinas elétricas", "Mas não sumiu"], side: "Direito", location: "Mesa", year: 2023 },
  { titles: ["Da perspectiva e contra ela", "Devorei muitos quadrados", "POV"], side: "Esquerdo", location: "Atelie", year: 2024 },
  { titles: ["O caminho para si mesmo. Pela impossibilidade de não ser", "A transfiguração do tabu em totem", "A menor distância entre dois pontos"], side: "Direito", location: "UFSCar", year: 2025 },
  { titles: ["Os futuristas e os outros", "Distâncias tornam difícil o contrário", "Sonotron"], side: "Esquerdo", location: "Mesa", year: 2021 },
  { titles: ["Lá menor com nona", "Não quero ser... sem que me olhes", "Noeyni"], side: "Esquerdo", location: "Mesa", year: 2023 },
  { titles: ["Por uma identidade que não me devore", "Eu existo apenas na privacidade dos meus sonhos", "Eu posso parar quando eu quiser"], side: "Esquerdo", location: "Mesa", year: 2021 },
  { titles: ["Só me interessa o que não é meu", "HyperLogLog++", "Os símbolos da prosperidade são os símbolos da dependência"], side: "Direito", location: "Mesa", year: 2023 },
  { titles: ["A ilusão do percurso retilíneo da aleluia ao tangenciar a luz", "Uma história em 3 partes", "Tonantzin"], side: "Esquerdo", location: "Mesa", year: 2022 },
  { titles: ["Balahaus", "Erros de design com grandes consequências", "A sombra mais escura é aquela sob a vela"], side: "Direito", location: "Emoldurar", year: 2024 },
  { titles: ["Schadenfreude", "Chutando a escada", "O critério de Kelly"], side: "Esquerdo", location: "Mesa", year: 2024 },
  { titles: ["The bends", "Emitiram um comunicado adiando o futuro em mais duas gerações, você viu?", "Apoptose"], side: "Direito", location: "Mesa", year: 2022 },
  { titles: ["O instinto caraíba", "Ossobuco", "Ativo fiscal e passivo não circulante"], side: "Esquerdo", location: "Casa", year: 2022 },
  { titles: ["الرمال المتحركة", "Ursula cega", "Morganídeo"], side: "Direito", location: "Casa", year: 2025 },
  { titles: ['Arte da capa para "Kineli" (Não lançado)', "Sigam meu mano nas redes", "@igorkineli"], side: "Esquerdo", location: "Mesa", year: 2024 },
]

export const artworks = raw.map((a, id) => ({
  id,
  ...a,
  // Place real images at public/artworks/0.jpg, public/artworks/1.jpg, etc.
  // Gradient placeholders are used as fallback when real images are missing.
  placeholder: placeholder(id),
}))

export const series = [
  { id: 'semaforismo', name: 'Semaforismo', artworkIds: artworks.map(a => a.id) },
]

export const exhibitions = [
  { id: 'biblioteca-ufscar-2025', name: 'Biblioteca UFSCar', year: 2025, artworkIds: artworks.map(a => a.id) },
]
