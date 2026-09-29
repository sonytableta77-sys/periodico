export interface Story {
  id: string;
  title: string;
  text: string;
  date: string;
}

export const initialStories: Story[] = [
  {
    id: '1',
    title: 'EL ECO DEL VIEJO RELOJERO',
    text: `A las siete y doce de la tarde, don Aurelio comprendió que el péndulo del reloj de pared ya no medía los segundos ordinarios, sino los instantes que alguien había olvidado vivir.

—No se preocupe por el retraso —murmuró la figura envuelta en gabardina que acababa de cruzar el umbral sin hacer sonar la campanilla—. Vengo a reclamar las horas que perdí aquel otoño de mil novecientos veinticuatro.

Don Aurelio levantó la vista por encima de sus lentes. La ficción tiene paciencia infinita, y la verdad siempre llega con retraso.`,
    date: '29 DE SEPTIEMBRE DE 2026'
  },
  {
    id: '2',
    title: 'EL ÚLTIMO TREN DE LAS CERO HORAS',
    text: `El andén número cuatro nunca figuraba en las pizarras de la estación central. Solo quienes extraviaban el billete de vuelta descubrían la verja entreabierta detrás del viejo depósito de carbón.

A medianoche exacta, una locomotora a vapor frenaba sin chirriar sobre los rieles cubiertos de musgo. No transportaba maletas, únicamente cartas que nunca se atrevieron a ser enviadas.

El revisor siempre decía lo mismo:
—Próxima parada: las palabras que debiste pronunciar a tiempo.`,
    date: '28 DE SEPTIEMBRE DE 2026'
  }
];
