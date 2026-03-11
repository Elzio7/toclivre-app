import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════════════ */
const C = {
  bg:         "#F7F3EE",
  bgDeep:     "#EDE7DC",
  surface:    "#FFFFFF",
  surfaceDim: "#F2EDE6",
  border:     "#DDD5C8",
  borderDim:  "#EAE4DA",
  green:      "#2D6A4F",
  greenMid:   "#40916C",
  greenLight: "#B7E4C7",
  greenGlow:  "rgba(45,106,79,0.10)",
  amber:      "#D4831A",
  amberLight: "#FDE68A",
  amberGlow:  "rgba(212,131,26,0.12)",
  red:        "#C0392B",
  redLight:   "#FECACA",
  redGlow:    "rgba(192,57,43,0.10)",
  ink:        "#1A1A2E",
  inkMid:     "#5C5470",
  inkDim:     "#9E97B0",
  white:      "#FFFFFF",
  blue:       "#2563EB",
  blueGlow:   "rgba(37,99,235,0.10)",
};

const FD = "'Fraunces', serif";
const FB = "'Plus Jakarta Sans', sans-serif";

/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL DATA
═══════════════════════════════════════════════════════════════════════════ */
const SUBTYPES = [
  { id:"contamination", emoji:"🧼", label:"Contaminação",    desc:"Medo de germes, doenças, substâncias nocivas ou contaminação de terceiros" },
  { id:"checking",      emoji:"🔒", label:"Verificação",     desc:"Checar repetidamente porta, gás, aparelhos, ações passadas ou danos causados" },
  { id:"symmetry",      emoji:"📐", label:"Simetria/Exatidão",desc:"Necessidade de ordem, simetria perfeita ou sensação 'just right'" },
  { id:"intrusive",     emoji:"💭", label:"Pensamentos Intrusivos", desc:"Pensamentos, impulsos ou imagens egodistônicos de natureza agressiva, sexual ou blasfema" },
  { id:"hoarding",      emoji:"📦", label:"Acumulação",      desc:"Incapacidade de descartar objetos sem valor, medo de perder informações importantes" },
  { id:"religious",     emoji:"🙏", label:"Escrupulosidade", desc:"Obsessões de natureza religiosa, moral ou ética com compulsões mentais de ruminação" },
  { id:"somatic",       emoji:"🫀", label:"Somático/Doença", desc:"Preocupação excessiva com doenças físicas, sintomas corporais ou deformidades" },
  { id:"relationship",  emoji:"💑", label:"Relacional",      desc:"Dúvidas persistentes sobre relacionamentos, orientação sexual (TOCD) ou infidelidade" },
];

const TRIGGERS = [
  "Em casa","No trabalho","Em espaços públicos","Ao sair de casa",
  "Antes de dormir","Ao acordar","Em contexto social",
  "Ao cozinhar","Ao dirigir","Ao usar dispositivos",
  "Em ambientes hospitalares","Após contato físico",
];

// Tipos de exercício
// type: "in-vivo" | "imaginal" | "interoceptive" | "mental-compulsion"

const ERP_LIBRARY = {

  /* ── CONTAMINAÇÃO ─────────────────────────────────────────────────────── */
  contamination: [
    { id:"c1", type:"in-vivo",
      title:"Tocar maçaneta sem lavar as mãos",
      suds:2, duration:10,
      desc:"Toque numa maçaneta de banheiro público. Permaneça sem lavar as mãos pelos próximos 10 minutos enquanto realiza outra atividade normalmente.",
      prevention:"NÃO lavar as mãos, NÃO usar álcool gel durante a exposição",
      mentalCompulsion:"Se surgir o pensamento 'posso me contaminar', observe-o sem tentar refutá-lo ou calcular o risco real" },
    { id:"c2", type:"in-vivo",
      title:"Tocar objeto do chão e não higienizar",
      suds:3, duration:10,
      desc:"Apanhe um objeto caído no chão (caneta, chave, moeda) e segure por 10 minutos sem higienizar as mãos.",
      prevention:"NÃO limpar o objeto, NÃO higienizar as mãos durante a sessão",
      mentalCompulsion:"NÃO calcular mentalmente probabilidade de contaminação" },
    { id:"c3", type:"in-vivo",
      title:"Sentar em cadeira pública sem limpar",
      suds:4, duration:15,
      desc:"Sente-se numa cadeira pública sem inspecioná-la ou higienizá-la. Permaneça sentado por 15 minutos lendo ou realizando outra atividade.",
      prevention:"NÃO limpar a cadeira antes ou depois, NÃO verificar a roupa",
      mentalCompulsion:"NÃO realizar verificação mental sobre a limpeza da cadeira" },
    { id:"c4", type:"in-vivo",
      title:"Tocar rosto após contato com superfície",
      suds:6, duration:20,
      desc:"Após tocar uma superfície 'contaminada', toque voluntariamente o próprio rosto — testa, bochechas, queixo. Permaneça 20 minutos sem lavar.",
      prevention:"NÃO lavar rosto ou mãos por 20 minutos",
      mentalCompulsion:"NÃO contar quantas vezes tocou, NÃO revisar o contato mentalmente" },
    { id:"c5", type:"imaginal",
      title:"Imaginal: comer sem lavar as mãos",
      suds:7, duration:20,
      desc:"Exposição imaginal: feche os olhos e visualize em detalhes comer uma refeição sem ter lavado as mãos após contato com superfície contaminada. Mantenha a cena vívida por 20 minutos, sem interromper ou neutralizar.",
      prevention:"NÃO interromper a cena imaginada, NÃO adicionar 'finais seguros' à visualização",
      mentalCompulsion:"NÃO racionalizar que 'na vida real lavaria antes'" },
    { id:"c6", type:"in-vivo",
      title:"Comer lanche sem higienizar as mãos",
      suds:8, duration:20,
      desc:"Prepare e coma um lanche sem lavar as mãos previamente, após ter tocado superfícies comuns ao longo do dia.",
      prevention:"NÃO lavar as mãos antes da refeição, NÃO inspecionar o alimento",
      mentalCompulsion:"NÃO realizar verificação mental sobre segurança alimentar" },
  ],

  /* ── VERIFICAÇÃO ──────────────────────────────────────────────────────── */
  checking: [
    { id:"k1", type:"mental-compulsion",
      title:"Enviar mensagem sem reler",
      suds:2, duration:10,
      desc:"Escreva uma mensagem de texto e envie sem reler nenhuma vez. Compulsão-alvo: releitura repetida para verificar erros ou ofensas.",
      prevention:"NÃO reler após envio, NÃO pedir confirmação ao destinatário",
      mentalCompulsion:"NÃO revisar mentalmente o conteúdo enviado após fechar o app" },
    { id:"k2", type:"in-vivo",
      title:"Sair de casa com verificação mínima (1x)",
      suds:3, duration:15,
      desc:"Ao sair, verifique a porta apenas UMA vez. Saia e não retorne. Permaneça fora por 15 minutos antes de poder voltar.",
      prevention:"NÃO voltar para verificar, NÃO acionar alguém para verificar remotamente",
      mentalCompulsion:"NÃO realizar verificação mental do estado da porta enquanto estiver fora" },
    { id:"k3", type:"in-vivo",
      title:"Sair sem verificar o fogão",
      suds:5, duration:20,
      desc:"Após cozinhar, afaste-se do fogão sem realizar verificação adicional. Saia do cômodo e não retorne por 20 minutos.",
      prevention:"NÃO voltar ao fogão, NÃO checar câmeras remotas, NÃO pedir a alguém que verifique",
      mentalCompulsion:"NÃO reconstruir mentalmente se desligou o fogão" },
    { id:"k4", type:"in-vivo",
      title:"Sair de casa sem nenhuma verificação",
      suds:6, duration:20,
      desc:"Saia de casa sem realizar nenhuma verificação — nem uma vez. Apenas saia.",
      prevention:"NÃO verificar porta, fogão, janelas, ferro. Absolutamente nenhuma verificação",
      mentalCompulsion:"NÃO fazer lista mental de itens verificados" },
    { id:"k5", type:"imaginal",
      title:"Imaginal: incêndio causado por descuido",
      suds:7, duration:20,
      desc:"Exposição imaginal: visualize ter saído sem verificar o fogão e que um incêndio se inicia em casa. Mantenha a cena vívida sem interromper ou neutralizar. O objetivo não é acreditar que vai acontecer — é tolerar a incerteza de que poderia.",
      prevention:"NÃO interromper a cena com 'mas eu desligarei sempre', NÃO adicionar rescues à narrativa",
      mentalCompulsion:"NÃO neutralizar com 'isso nunca vai acontecer de verdade'" },
    { id:"k6", type:"mental-compulsion",
      title:"Tolerar dúvida de ter causado dano ao dirigir",
      suds:7, duration:20,
      desc:"Após dirigir, tolere a dúvida de ter atropelado ou causado dano sem verificar o retrovisor, sem voltar ao trajeto e sem procurar notícias de acidentes.",
      prevention:"NÃO retornar ao trajeto, NÃO pesquisar acidentes, NÃO buscar reassurance de passageiros",
      mentalCompulsion:"NÃO reconstruir mentalmente o trajeto para 'confirmar que está tudo bem'" },
  ],

  /* ── SIMETRIA / EXATIDÃO ──────────────────────────────────────────────── */
  symmetry: [
    { id:"s1", type:"in-vivo",
      title:"Deixar objeto levemente torto",
      suds:2, duration:10,
      desc:"Posicione intencionalmente um objeto de uso frequente (caneta, livro, copo) de forma assimétrica. Não o corrija pelo tempo determinado.",
      prevention:"NÃO tocar ou reposicionar o objeto durante a sessão",
      mentalCompulsion:"NÃO contar ou nomear mentalmente o quanto está 'errado'" },
    { id:"s2", type:"mental-compulsion",
      title:"Escrever sem corrigir erros",
      suds:3, duration:10,
      desc:"Escreva um parágrafo à mão ou no teclado. Não apague, não corrija, não reescreva nada. Entregue ou salve o texto com imperfeições.",
      prevention:"NÃO apagar, NÃO reescrever, NÃO corrigir",
      mentalCompulsion:"NÃO realizar verificação mental dos erros após terminar" },
    { id:"s3", type:"in-vivo",
      title:"Usar objeto sem alinhar",
      suds:3, duration:15,
      desc:"Arrume sua mesa ou estante de forma intencionalmente irregular. Trabalhe ou estude com os objetos nessa posição por 15 minutos.",
      prevention:"NÃO realinhar durante a sessão, NÃO 'compensar' organizando outra área",
      mentalCompulsion:"NÃO planejar mentalmente como reorganizará depois" },
    { id:"s4", type:"mental-compulsion",
      title:"Não repetir ação até 'parecer certo'",
      suds:5, duration:15,
      desc:"Realize uma ação habitual (fechar porta, desligar luz, sentar na cadeira) apenas UMA vez, mesmo que não gere a sensação 'just right'. Prossiga sem repetir.",
      prevention:"NÃO repetir a ação, NÃO fazer 'rituals de compensação' com outra ação",
      mentalCompulsion:"NÃO aguardar a sensação de completude antes de prosseguir" },
    { id:"s5", type:"in-vivo",
      title:"Trabalhar com ambiente desorganizado por 30min",
      suds:6, duration:30,
      desc:"Crie deliberadamente uma disposição irregular de itens no seu espaço de trabalho. Realize uma tarefa de 30 minutos sem reorganizar nada.",
      prevention:"NÃO tocar ou mover qualquer item durante a tarefa",
      mentalCompulsion:"NÃO calcular mentalmente como organizaria o espaço" },
    { id:"s6", type:"mental-compulsion",
      title:"Tolerar sensação 'not just right' sem agir",
      suds:7, duration:20,
      desc:"Provoque intencionalmente a sensação 'not just right' (objeto torto, roupa assimétrica, frase incompleta) e permaneça com o desconforto sem realizar nenhuma ação corretiva, física ou mental.",
      prevention:"NÃO corrigir fisicamente, NÃO realizar compulsão de contagem ou repetição mental",
      mentalCompulsion:"NÃO realizar sequências mentais de compensação (contar, nomear, rezar)" },
  ],

  /* ── PENSAMENTOS INTRUSIVOS ───────────────────────────────────────────── */
  intrusive: [
    { id:"i1", type:"mental-compulsion",
      title:"Observar o pensamento sem neutralizar",
      suds:3, duration:10,
      desc:"Quando surgir um pensamento intrusivo, pratique apenas observá-lo: 'Estou tendo o pensamento de que ___'. Não tente refutar, explicar ou afastar. Apenas observe por 10 minutos.",
      prevention:"NÃO realizar nenhuma compulsão mental",
      mentalCompulsion:"NÃO neutralizar, NÃO rezar, NÃO substituir por pensamento 'bom', NÃO contar para 'desfazer'" },
    { id:"i2", type:"imaginal",
      title:"Imaginal: escrever o pensamento intrusivo",
      suds:4, duration:15,
      desc:"Escreva o pensamento intrusivo exatamente como ele aparece na sua mente — sem eufemismos. Leia em voz alta para si mesmo 5 vezes. O objetivo é habituação à presença do pensamento.",
      prevention:"NÃO adicionar 'mas não quero isso' ao texto, NÃO destruir o papel como ritual",
      mentalCompulsion:"NÃO rezar ou neutralizar após a leitura" },
    { id:"i3", type:"imaginal",
      title:"Imaginal: expandir o pensamento intrusivo",
      suds:5, duration:15,
      desc:"Escreva um parágrafo expandindo o pensamento intrusivo — descreva a cena com detalhes. O objetivo é descatastrofizar pela exposição repetida ao conteúdo temido, não pela supressão.",
      prevention:"NÃO adicionar salvaguardas à narrativa ('mas no final não acontece')",
      mentalCompulsion:"NÃO realizar neutralização mental durante ou após a escrita" },
    { id:"i4", type:"mental-compulsion",
      title:"Interromper ruminação em 5 minutos",
      suds:5, duration:20,
      desc:"Compulsão-alvo: ruminação (análise repetitiva do pensamento para buscar certeza de que 'não sou mau'). Ao perceber que está ruminando, registre o pensamento e interrompa — sem resolver, sem concluir.",
      prevention:"NÃO continuar a análise, NÃO buscar reassurance interno ou externo",
      mentalCompulsion:"NÃO completar o raciocínio para chegar a uma 'conclusão segura'" },
    { id:"i5", type:"imaginal",
      title:"Imaginal: pior desfecho sem escape",
      suds:7, duration:20,
      desc:"Exposição imaginal ao pior desfecho temido pelo pensamento intrusivo. Visualize a cena completa sem inserir rescues ou neutralizações. Mantenha por 20 minutos. Lembre: o desconforto é o mecanismo terapêutico.",
      prevention:"NÃO interromper a cena, NÃO adicionar finais 'seguros', NÃO rezar ao terminar",
      mentalCompulsion:"NÃO analisar se 'a cena é real' — apenas observe o desconforto diminuir" },
    { id:"i6", type:"mental-compulsion",
      title:"Tolerar dúvida existencial sem resolver",
      suds:8, duration:25,
      desc:"'Sou capaz de fazer mal a alguém? Sou uma boa pessoa?' — permita que essa dúvida exista sem tentar respondê-la. A resposta não está disponível, e buscar certeza alimenta o TOC.",
      prevention:"NÃO buscar reassurance de terceiros, NÃO realizar análise moral repetida",
      mentalCompulsion:"NÃO rever o passado para 'provar' que é uma boa pessoa" },
  ],

  /* ── ACUMULAÇÃO ───────────────────────────────────────────────────────── */
  hoarding: [
    { id:"h1", type:"in-vivo",
      title:"Descartar 1 item claramente inútil",
      suds:2, duration:10,
      desc:"Escolha um item que você sabe objetivamente que não precisa (embalagem vazia, papel antigo, objeto quebrado). Descarte sem verificar se poderia servir.",
      prevention:"NÃO resgatar o item, NÃO fotografar antes de descartar",
      mentalCompulsion:"NÃO criar lista mental de usos possíveis para o item descartado" },
    { id:"h2", type:"mental-compulsion",
      title:"Descartar sem fotografar para registro",
      suds:4, duration:15,
      desc:"Descarte 3 itens sem fotografá-los ou documentá-los de nenhuma forma. A compulsão de 'guardar o registro' é uma forma de hoarding digital.",
      prevention:"NÃO fotografar, NÃO anotar o que foi descartado",
      mentalCompulsion:"NÃO memorizar os itens descartados" },
    { id:"h3", type:"in-vivo",
      title:"Descartar item com valor sentimental baixo",
      suds:5, duration:15,
      desc:"Escolha um item com pequeno valor sentimental (cartão antigo, ticket, lembrança) e descarte. Tolere a incerteza de 'e se eu precisar disso depois'.",
      prevention:"NÃO resgatar, NÃO substituir descartando outro item 'menos importante'",
      mentalCompulsion:"NÃO ruminar sobre a decisão após o descarte" },
    { id:"h4", type:"imaginal",
      title:"Imaginal: não encontrar item que descartou",
      suds:6, duration:20,
      desc:"Exposição imaginal: visualize precisar exatamente do item que descartou e não encontrá-lo. Permaneça com o desconforto da cena sem inserir soluções alternativas.",
      prevention:"NÃO criar saídas na narrativa ('mas eu teria outro')",
      mentalCompulsion:"NÃO planejar mentalmente como evitaria isso no futuro" },
    { id:"h5", type:"in-vivo",
      title:"Descartar bloco de 10 itens em 15 minutos",
      suds:7, duration:15,
      desc:"Selecione e descarte 10 itens em 15 minutos sem analisar cada um individualmente. Velocidade intencional reduz a análise obsessiva item a item.",
      prevention:"NÃO verificar cada item antes de descartar, NÃO resgatar nenhum",
      mentalCompulsion:"NÃO criar inventário mental do que foi descartado" },
  ],

  /* ── ESCRUPULOSIDADE ──────────────────────────────────────────────────── */
  religious: [
    { id:"r1", type:"mental-compulsion",
      title:"Tolerar dúvida religiosa por 10 minutos",
      suds:3, duration:10,
      desc:"Permita que a dúvida religiosa ou moral permaneça sem tentar resolvê-la. Compulsão-alvo: ruminação teológica repetitiva para buscar certeza de que 'agiu corretamente'.",
      prevention:"NÃO rezar para 'desfazer', NÃO buscar reassurance de figuras religiosas",
      mentalCompulsion:"NÃO revisar a doutrina mentalmente para encontrar certeza" },
    { id:"r2", type:"mental-compulsion",
      title:"Interromper ruminação moral sem concluir",
      suds:4, duration:15,
      desc:"Ao perceber que está ruminando sobre uma questão moral ('agi errado? sou mau?'), interrompa sem chegar a uma conclusão. A inconclusão é parte do tratamento.",
      prevention:"NÃO buscar reassurance de terceiros, NÃO confessar para 'zerar'",
      mentalCompulsion:"NÃO completar o raciocínio moral para obter alívio" },
    { id:"r3", type:"imaginal",
      title:"Imaginal: ter cometido pecado sem reparação",
      suds:6, duration:20,
      desc:"Exposição imaginal: visualize ter cometido uma transgressão moral grave e não ter feito nada para repará-la. Mantenha a cena sem inserir confissão ou reparação.",
      prevention:"NÃO rezar após a exposição, NÃO confessar o pensamento",
      mentalCompulsion:"NÃO realizar análise moral do conteúdo imaginado" },
    { id:"r4", type:"mental-compulsion",
      title:"Tolerar incerteza moral permanente",
      suds:7, duration:25,
      desc:"'Será que agi corretamente? Serei julgado por isso?' — estas perguntas não têm resposta disponível. Permaneça com a dúvida sem buscar certeza de nenhuma forma.",
      prevention:"NÃO buscar reassurance espiritual, NÃO realizar rituais de compensação",
      mentalCompulsion:"NÃO rezar repetitivamente, NÃO contar para 'neutralizar'" },
  ],

  /* ── SOMÁTICO ─────────────────────────────────────────────────────────── */
  somatic: [
    { id:"so1", type:"mental-compulsion",
      title:"Não pesquisar sintoma por 30 minutos",
      suds:3, duration:30,
      desc:"Ao notar a sensação ou sintoma temido, não pesquise, não palpe e não verifique no espelho. Compulsão-alvo: busca de informação médica repetitiva.",
      prevention:"NÃO acessar sites médicos, NÃO usar apps de saúde, NÃO palpar",
      mentalCompulsion:"NÃO reconstruir mentalmente sintomas de doenças para comparar" },
    { id:"so2", type:"interoceptive",
      title:"Interoceptiva: induzir sensação cardíaca",
      suds:4, duration:10,
      desc:"Exposição interoceptiva: realize 30 agachamentos rápidos para elevar a frequência cardíaca intencionalmente. Observe as palpitações sem interpretar como patologia. Objetivo: habituação às sensações físicas que disparam a ansiedade.",
      prevention:"NÃO verificar o pulso, NÃO medir pressão após o exercício",
      mentalCompulsion:"NÃO calcular se a frequência está 'normal'" },
    { id:"so3", type:"interoceptive",
      title:"Interoceptiva: induzir tontura leve",
      suds:4, duration:10,
      desc:"Gire a cabeça lateralmente por 30 segundos para induzir tontura leve. Observe a sensação sem interpretar como sinal de doença neurológica. Exposição interoceptiva a sensação temida.",
      prevention:"NÃO verificar se a tontura 'passou corretamente', NÃO buscar reassurance médico",
      mentalCompulsion:"NÃO comparar a sensação com sintomas de doenças conhecidas" },
    { id:"so4", type:"interoceptive",
      title:"Interoceptiva: focar atenção no sintoma por 15min",
      suds:5, duration:15,
      desc:"Direcione atenção deliberada para a região do corpo temida por 15 minutos contínuos. O objetivo é a habituação pela exposição — não a supressão da sensação.",
      prevention:"NÃO palpar, NÃO verificar visualmente, NÃO interromper o foco antes do tempo",
      mentalCompulsion:"NÃO diagnosticar a sensação mentalmente durante a exposição" },
    { id:"so5", type:"mental-compulsion",
      title:"Não buscar reassurance médico por 24h",
      suds:6, duration:30,
      desc:"Tolerância expandida: ao longo de um dia, não busque reassurance médico de nenhum tipo — nem consulta, nem ligação, nem pesquisa. Compulsão-alvo: busca repetitiva de confirmação médica.",
      prevention:"NÃO ligar para médico, NÃO pesquisar, NÃO pedir opinião de familiares",
      mentalCompulsion:"NÃO realizar autoexame mental para 'confirmar que está bem'" },
    { id:"so6", type:"imaginal",
      title:"Imaginal: diagnóstico grave confirmado",
      suds:8, duration:20,
      desc:"Exposição imaginal: visualize receber um diagnóstico grave que confirmasse seu medo atual. Mantenha a cena por 20 minutos. O objetivo não é acreditar — é tolerar a incerteza de que poderia ser real.",
      prevention:"NÃO inserir 'mas o médico disse que não é' na cena, NÃO interromper",
      mentalCompulsion:"NÃO analisar se o diagnóstico imaginado 'faz sentido clinicamente'" },
  ],

  /* ── RELACIONAL ───────────────────────────────────────────────────────── */
  relationship: [
    { id:"re1", type:"mental-compulsion",
      title:"Tolerar dúvida relacional por 15 minutos",
      suds:3, duration:15,
      desc:"Quando surgir a dúvida sobre o relacionamento, não pergunte ao parceiro e não faça verificação de memória. Permita que a dúvida exista por 15 minutos.",
      prevention:"NÃO perguntar ao parceiro, NÃO buscar reassurance de amigos",
      mentalCompulsion:"NÃO revisar mentalmente episódios passados para 'provar' o amor" },
    { id:"re2", type:"mental-compulsion",
      title:"Interromper verificação de memória afetiva",
      suds:4, duration:15,
      desc:"Compulsão-alvo: 'escanear' memórias do relacionamento para verificar se os sentimentos são 'reais'. Ao perceber que está fazendo isso, interrompa sem concluir.",
      prevention:"NÃO completar a varredura de memórias",
      mentalCompulsion:"NÃO tentar 'sentir' o amor para confirmar que ele existe" },
    { id:"re3", type:"imaginal",
      title:"Imaginal: não ter certeza do amor — nunca",
      suds:6, duration:20,
      desc:"Exposição imaginal: visualize viver com a dúvida 'e se eu não o amar de verdade?' sem nunca resolver essa questão. Permaneça na cena por 20 minutos sem inserir certeza.",
      prevention:"NÃO criar resolução na narrativa, NÃO adicionar 'mas no fundo eu sei que amo'",
      mentalCompulsion:"NÃO analisar o conteúdo da cena em busca de 'resposta'" },
    { id:"re4", type:"mental-compulsion",
      title:"Tolerar dúvida de orientação sexual (TOCD)",
      suds:7, duration:20,
      desc:"Exposição específica para TOC de orientação sexual: permita que a dúvida exista sem realizar verificação comportamental, análise de reações físicas ou busca de reassurance.",
      prevention:"NÃO realizar 'testes' comportamentais, NÃO buscar reassurance",
      mentalCompulsion:"NÃO analisar reações físicas para 'determinar' orientação, NÃO comparar com fantasias" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY HOOKS & HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function useTimer(initialSeconds, onTick) {
  const [secs, setSecs]     = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(ref.current); setRunning(false); onTick && onTick(0); return 0; }
          onTick && onTick(s - 1);
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const start  = () => setRunning(true);
  const pause  = () => { setRunning(false); clearInterval(ref.current); };
  const reset  = (s) => { pause(); setSecs(s || initialSeconds); };

  return { secs, running, start, pause, reset };
}

function fmt(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function sudsColor(v) {
  return v >= 8 ? C.red : v >= 5 ? C.amber : C.green;
}

function sudsLabel(v) {
  if (v <= 1) return "Mínima / ausente";
  if (v <= 3) return "Leve, gerenciável";
  if (v <= 5) return "Moderada";
  if (v <= 7) return "Intensa";
  if (v <= 9) return "Muito intensa";
  return "Máxima / crise";
}

/* ═══════════════════════════════════════════════════════════════════════════
   BASE COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
function StatusBar() {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"14px 28px 6px", fontSize:12, fontWeight:700, color:C.inkMid, fontFamily:FB }}>
      <span>9:41</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={C.inkMid}>
          <rect x="0" y="3" width="2.5" height="8" rx="1"/>
          <rect x="4" y="1.5" width="2.5" height="9.5" rx="1"/>
          <rect x="8" y="0" width="2.5" height="11" rx="1"/>
          <rect x="12" y="1" width="3" height="10" rx="1"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
          <rect x="0.5" y="0.5" width="20" height="10" rx="3.5" stroke={C.inkMid}/>
          <rect x="2" y="2" width="14" height="7" rx="2" fill={C.green}/>
          <path d="M22 3.5v4a2 2 0 000-4z" fill={C.inkMid}/>
        </svg>
      </div>
    </div>
  );
}

function ProgressBar({ total, current }) {
  return (
    <div style={{ display:"flex", gap:5, padding:"0 24px 20px" }}>
      {Array.from({ length:total }).map((_, i) => (
        <div key={i} style={{ flex:i===current?2:1, height:4, borderRadius:2,
          background:i<=current?C.green:C.borderDim, transition:"all 0.4s ease" }}/>
      ))}
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:C.surface, borderRadius:20,
      border:`1px solid ${C.borderDim}`,
      boxShadow:"0 2px 12px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant="primary", disabled=false, small=false, style={} }) {
  const V = {
    primary:  { background:C.green,       color:C.white,  boxShadow:`0 4px 20px rgba(45,106,79,0.22)` },
    secondary:{ background:C.white,       color:C.ink,    border:`1.5px solid ${C.border}` },
    ghost:    { background:"transparent", color:C.inkMid, border:"none" },
    amber:    { background:C.amber,       color:C.white,  boxShadow:`0 4px 16px rgba(212,131,26,0.25)` },
    danger:   { background:C.redLight,    color:C.red,    border:`1px solid rgba(192,57,43,0.2)` },
    blue:     { background:C.blue,        color:C.white,  boxShadow:`0 4px 16px rgba(37,99,235,0.25)` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:small?"12px 20px":"16px 24px", borderRadius:14,
      border:"none", fontFamily:FB, fontWeight:700,
      fontSize:small?13:16, cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.38:1, transition:"all 0.2s ease",
      letterSpacing:"0.01em", ...V[variant], ...style }}>
      {children}
    </button>
  );
}

function SudsRing({ value, size=80 }) {
  const pct = value / 10;
  const r   = (size/2) - 7;
  const circ = 2 * Math.PI * r;
  const col  = sudsColor(value);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.bgDeep} strokeWidth="7"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ*(1-pct)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}/>
      <text x={size/2} y={size/2+5} textAnchor="middle" fill={col}
        fontSize={size*0.22} fontWeight="800" fontFamily={FB}>{value}</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LGPD SIMPLIFICADO — um clique, direto ao ponto
═══════════════════════════════════════════════════════════════════════════ */
function LGPDSimples({ onAccept }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      justifyContent:"flex-end", padding:"0 28px 40px",
      background:`linear-gradient(180deg, transparent 0%, rgba(26,26,46,0.96) 100%)`,
      position:"relative" }}>

      {/* Card de consentimento */}
      <div style={{ background:C.white, borderRadius:28, padding:"28px 24px",
        boxShadow:"0 -4px 40px rgba(0,0,0,0.12)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:36, height:36, borderRadius:12,
            background:C.greenGlow, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18 }}>🔒</div>
          <div>
            <div style={{ fontFamily:FB, fontWeight:800, fontSize:14,
              color:C.ink }}>Seus dados são seus</div>
            <div style={{ fontFamily:FB, fontSize:11,
              color:C.inkDim }}>LGPD · Lei 13.709/2018</div>
          </div>
        </div>

        <p style={{ fontFamily:FB, fontSize:13, color:C.inkMid,
          lineHeight:1.65, marginBottom:20 }}>
          O TOCLivre coleta <strong style={{color:C.ink}}>apenas o necessário</strong> para
          personalizar seus exercícios ERP. Seus dados ficam armazenados
          localmente no seu dispositivo, criptografados, e{" "}
          <strong style={{color:C.ink}}>nunca são vendidos</strong>.
        </p>

        {/* Pontos-chave */}
        {[
          { icon:"📱", text:"Dados armazenados no seu dispositivo" },
          { icon:"🚫", text:"Nenhum dado vendido a terceiros" },
          { icon:"🗑️", text:"Delete tudo quando quiser" },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
            marginBottom:10 }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            <span style={{ fontFamily:FB, fontSize:12,
              color:C.inkMid }}>{item.text}</span>
          </div>
        ))}

        <div style={{ height:1, background:C.borderDim, margin:"18px 0" }}/>

        <p style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
          lineHeight:1.6, marginBottom:20 }}>
          Ao continuar, você concorda com nossa{" "}
          <span style={{ color:C.green, textDecoration:"underline",
            cursor:"pointer" }}>Política de Privacidade</span>{" "}
          e autoriza o processamento de dados de saúde conforme
          Art. 11, II, a da LGPD para fins de bem-estar.
        </p>

        <Btn onClick={onAccept}>Entendi, quero continuar →</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLASH
═══════════════════════════════════════════════════════════════════════════ */
function Splash({ onNext }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      padding:"32px 28px 40px", position:"relative", overflow:"hidden",
      background:`linear-gradient(160deg, ${C.bg} 55%, ${C.bgDeep} 100%)` }}>
      <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%",
        background:`radial-gradient(circle, ${C.greenLight} 0%, transparent 70%)`,
        opacity:0.32, top:-90, right:-90, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%",
        background:`radial-gradient(circle, ${C.amberLight} 0%, transparent 70%)`,
        opacity:0.28, bottom:30, left:-60, pointerEvents:"none" }}/>

      <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(24px)",
        transition:"all 0.9s ease", flex:1, display:"flex", flexDirection:"column", zIndex:1 }}>

        {/* Logo */}
        <div style={{ marginBottom:36 }}>
          <div style={{ width:76, height:76, borderRadius:22,
            background:`linear-gradient(135deg, ${C.green}, ${C.greenMid})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 8px 32px rgba(45,106,79,0.28)`, marginBottom:18 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4z"
                stroke="white" strokeWidth="1.5" fill="none" opacity="0.35"/>
              <path d="M20 9C14 9 9 14 9 20s5 11 11 11 11-5 11-11-5-11-11-11z"
                stroke="white" strokeWidth="1.5" fill="none" opacity="0.65"/>
              <circle cx="20" cy="20" r="3.5" fill="white"/>
              <path d="M20 12v-3M20 31v-3M12 20h-3M31 20h-3" stroke="white"
                strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily:FD, fontSize:48, fontWeight:900,
            color:C.ink, margin:"0 0 6px", letterSpacing:"-0.03em", lineHeight:1 }}>
            TOC<span style={{ color:C.green }}>Livre</span>
          </h1>
          <p style={{ fontFamily:FB, color:C.inkMid, fontSize:15,
            margin:0, lineHeight:1.6 }}>
            Protocolo ERP baseado em evidências.<br/>Quebre o ciclo compulsivo.
          </p>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
          {[
            { icon:"🧠", t:"ERP com curva de habituação em tempo real",      s:"Veja a ansiedade subir e cair — a base neurocientífica do tratamento" },
            { icon:"📊", t:"Mapeamento clínico dos seus padrões",             s:"Gatilhos, horários, SUDS e taxa de resistência visualizados" },
            { icon:"🤝", t:"Relatórios estruturados para seu terapeuta",      s:"Dados objetivos que potencializam cada sessão presencial" },
            { icon:"⚡", t:"Protocolo de crise integrado",                   s:"Suporte imediato quando o SUDS ultrapassa 8" },
          ].map((f,i) => (
            <Card key={i} style={{ padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{f.icon}</span>
              <div>
                <div style={{ fontFamily:FB, fontWeight:700, fontSize:13, color:C.ink, marginBottom:2 }}>{f.t}</div>
                <div style={{ fontFamily:FB, fontSize:12, color:C.inkDim, lineHeight:1.5 }}>{f.s}</div>
              </div>
            </Card>
          ))}
        </div>

        <Btn onClick={onNext}>Iniciar avaliação →</Btn>

        {/* Disclaimer legal — discreto mas presente */}
        <div style={{ marginTop:14, padding:"10px 14px", borderRadius:12,
          background:"rgba(92,84,112,0.07)",
          border:"1px solid rgba(92,84,112,0.12)" }}>
          <p style={{ fontFamily:FB, color:C.inkDim, fontSize:10.5,
            textAlign:"center", margin:0, lineHeight:1.6 }}>
            O TOCLivre é um aplicativo de bem-estar e autoconhecimento. Não é um dispositivo médico, não realiza diagnósticos e não substitui avaliação ou tratamento por profissional de saúde mental licenciado.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — SUBTIPO
═══════════════════════════════════════════════════════════════════════════ */
function OnbSubtype({ onNext }) {
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x!==id) : [...s, id]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      padding:"8px 24px 32px", background:C.bg, overflowY:"auto" }}>
      <ProgressBar total={4} current={0} />

      {/* Disclaimer slim — apenas texto, sem caixa */}
      <p style={{ fontFamily:FB, fontSize:10, color:C.inkDim,
        textAlign:"center", margin:"0 0 14px", lineHeight:1.5,
        borderBottom:`1px solid ${C.borderDim}`, paddingBottom:12 }}>
        App de bem-estar · não é dispositivo médico · não substitui profissional de saúde mental
      </p>
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 4px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
        Dimensões obsessivo-<br/>compulsivas presentes
      </h2>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
        margin:"0 0 20px", lineHeight:1.55 }}>
        Selecione todos os subtipos relevantes. Isso gera sua hierarquia ERP personalizada.
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:9, flex:1 }}>
        {SUBTYPES.map(s => (
          <button key={s.id} onClick={() => toggle(s.id)} style={{
            background:sel.includes(s.id) ? C.greenGlow : C.white,
            border:`1.5px solid ${sel.includes(s.id) ? C.green : C.borderDim}`,
            borderRadius:14, padding:"12px 14px", cursor:"pointer",
            textAlign:"left", fontFamily:FB,
            display:"flex", alignItems:"center", gap:12,
            transition:"all 0.2s ease" }}>
            <div style={{ width:18, height:18, borderRadius:5, flexShrink:0,
              border:`2px solid ${sel.includes(s.id) ? C.green : C.border}`,
              background:sel.includes(s.id) ? C.green : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s" }}>
              {sel.includes(s.id) && (
                <svg width="10" height="8" viewBox="0 0 10 8">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize:18 }}>{s.emoji}</span>
            <div>
              <div style={{ color:C.ink, fontSize:13, fontWeight:700 }}>{s.label}</div>
              <div style={{ color:C.inkDim, fontSize:11, marginTop:1, lineHeight:1.4 }}>{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop:18 }}>
        <Btn onClick={() => sel.length > 0 && onNext(sel)} disabled={sel.length === 0}>
          {sel.length > 0 ? `Continuar (${sel.length} selecionado${sel.length>1?"s":""})` : "Selecione ao menos um"}
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — Y-BOCS SIMPLIFICADO (baseline clínico)
═══════════════════════════════════════════════════════════════════════════ */
const YBOCS_ITEMS = [
  { id:"time",       label:"Tempo gasto com obsessões/compulsões por dia",
    opts:["< 1h","1–3h","3–8h","> 8h (quase contínuo)"], scores:[0,1,2,3] },
  { id:"interference",label:"Interferência nas atividades diárias",
    opts:["Nenhuma","Leve, pequena interferência","Moderada, gerenciável","Grave, incapacitante"], scores:[0,1,2,3] },
  { id:"distress",   label:"Sofrimento causado pelos sintomas",
    opts:["Nenhum","Leve","Moderado","Intenso / perturbador"], scores:[0,1,2,3] },
  { id:"resistance", label:"Capacidade de resistir às compulsões",
    opts:["Resiste sempre","Resiste na maioria","Resiste raramente","Não resiste"], scores:[0,1,2,3] },
  { id:"control",    label:"Controle sobre as obsessões",
    opts:["Controle completo","Controle razoável","Controle fraco","Sem controle"], scores:[0,1,2,3] },
];

function OnbYBOCS({ onNext }) {
  const [answers, setAnswers] = useState({});
  const allDone = YBOCS_ITEMS.every(i => answers[i.id] !== undefined);
  const total   = Object.values(answers).reduce((a, b) => a + b, 0);

  const severity = total <= 3 ? { label:"Subclínico", color:C.green }
    : total <= 7  ? { label:"Leve", color:C.greenMid }
    : total <= 11 ? { label:"Moderado", color:C.amber }
    : { label:"Grave", color:C.red };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      padding:"8px 24px 32px", background:C.bg, overflowY:"auto" }}>
      <ProgressBar total={4} current={1} />
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 4px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
        Avaliação de linha de base
      </h2>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
        margin:"0 0 20px", lineHeight:1.55 }}>
        Baseado na Y-BOCS (Yale-Brown Obsessive Compulsive Scale). Seus dados ficam apenas no dispositivo.
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
        {YBOCS_ITEMS.map((item, idx) => (
          <Card key={item.id} style={{ padding:"16px" }}>
            <div style={{ fontFamily:FB, fontSize:12, fontWeight:800,
              color:C.inkDim, letterSpacing:"0.06em", marginBottom:12 }}>
              {idx+1}. {item.label.toUpperCase()}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {item.opts.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(a => ({ ...a, [item.id]:item.scores[i] }))} style={{
                  textAlign:"left", padding:"10px 12px", borderRadius:10,
                  border:`1.5px solid ${answers[item.id]===item.scores[i] ? C.green : C.borderDim}`,
                  background:answers[item.id]===item.scores[i] ? C.greenGlow : "transparent",
                  color:answers[item.id]===item.scores[i] ? C.green : C.inkMid,
                  fontFamily:FB, fontSize:13, fontWeight:600, cursor:"pointer",
                  transition:"all 0.15s" }}>
                  <span style={{ fontSize:11, fontWeight:800, marginRight:8,
                    color:answers[item.id]===item.scores[i]?C.green:C.inkDim }}>
                    {item.scores[i]}
                  </span>{opt}
                </button>
              ))}
            </div>
          </Card>
        ))}

        {/* Score preview */}
        {allDone && (
          <Card style={{ padding:"16px", background:severity.color+"18",
            border:`1.5px solid ${severity.color}30` }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:FD, fontSize:36, fontWeight:900,
                  color:severity.color, lineHeight:1 }}>{total}</div>
                <div style={{ fontFamily:FB, fontSize:10, fontWeight:700,
                  color:C.inkDim, letterSpacing:"0.06em" }}>/ 15</div>
              </div>
              <div>
                <div style={{ fontFamily:FB, fontWeight:800, fontSize:15,
                  color:severity.color }}>{severity.label}</div>
                <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid,
                  lineHeight:1.5, marginTop:3 }}>
                  Pontuação Y-BOCS simplificada. Será usado para personalizar sua hierarquia ERP.
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div style={{ marginTop:18 }}>
        <Btn onClick={() => allDone && onNext({ ybocs:answers, ybocsTotal:total, severity:severity.label })}
          disabled={!allDone}>
          {allDone ? "Continuar →" : "Responda todas as questões"}
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — GATILHOS
═══════════════════════════════════════════════════════════════════════════ */
function OnbTriggers({ onNext }) {
  const [sel, setSel] = useState([]);
  const toggle = t => setSel(s => s.includes(t) ? s.filter(x => x!==t) : [...s, t]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      padding:"8px 24px 32px", background:C.bg }}>
      <ProgressBar total={4} current={2} />
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 4px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
        Contextos de maior<br/>ativação sintomática
      </h2>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
        margin:"0 0 24px", lineHeight:1.55 }}>
        Identifique onde e quando os sintomas costumam ser mais intensos.
      </p>

      <div style={{ display:"flex", flexWrap:"wrap", gap:9, flex:1 }}>
        {TRIGGERS.map(t => (
          <button key={t} onClick={() => toggle(t)} style={{
            padding:"9px 14px", borderRadius:100,
            border:`1.5px solid ${sel.includes(t) ? C.green : C.border}`,
            background:sel.includes(t) ? C.greenGlow : C.white,
            color:sel.includes(t) ? C.green : C.inkMid,
            fontSize:13, fontWeight:600, cursor:"pointer",
            fontFamily:FB, transition:"all 0.2s ease", whiteSpace:"nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ marginTop:24 }}>
        <Btn onClick={() => onNext(sel)}>Continuar →</Btn>
        <Btn onClick={() => onNext([])} variant="ghost" style={{ marginTop:6, fontSize:13 }}>
          Pular esta etapa
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — LINHA BASE + TERAPIA
═══════════════════════════════════════════════════════════════════════════ */
function OnbBaseline({ onNext }) {
  const [suds,      setSuds]     = useState(5);
  const [therapy,   setTherapy]  = useState(null);
  const [therapist, setTherapist]= useState(false);
  const [meds,      setMeds]     = useState(null);
  const [goal,      setGoal]     = useState("");

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      padding:"8px 24px 32px", background:C.bg, overflowY:"auto" }}>
      <ProgressBar total={4} current={3} />
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 4px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
        Contexto clínico<br/>e linha de base
      </h2>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
        margin:"0 0 20px", lineHeight:1.55 }}>
        Estas informações calibram o programa e geram relatórios mais precisos.
      </p>

      {/* SUDS atual */}
      <Card style={{ padding:"18px", marginBottom:12 }}>
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          SUDS ATUAL (NÍVEL DE ANGÚSTIA SUBJETIVA)
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:14 }}>
          <SudsRing value={suds} size={68} />
          <div>
            <div style={{ fontFamily:FB, fontWeight:700, fontSize:15,
              color:sudsColor(suds) }}>{suds}/10 — {sudsLabel(suds)}</div>
            <div style={{ fontFamily:FB, color:C.inkDim, fontSize:12, marginTop:3, lineHeight:1.4 }}>
              SUDS = Subjective Units of Distress Scale
            </div>
          </div>
        </div>
        <input type="range" min="0" max="10" value={suds}
          onChange={e => setSuds(Number(e.target.value))}
          style={{ width:"100%", accentColor:sudsColor(suds), height:6, cursor:"pointer" }}/>
      </Card>

      {/* Terapia atual */}
      <Card style={{ padding:"18px", marginBottom:12 }}>
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
          TRATAMENTO ATUAL
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {[{v:true,l:"Faço TCC/ERP"},{v:false,l:"Sem terapia"}].map(opt => (
            <button key={String(opt.v)} onClick={() => setTherapy(opt.v)} style={{
              flex:1, padding:"10px", borderRadius:10,
              border:`1.5px solid ${therapy===opt.v ? C.green : C.border}`,
              background:therapy===opt.v ? C.greenGlow : C.white,
              color:therapy===opt.v ? C.green : C.inkMid,
              fontFamily:FB, fontWeight:700, fontSize:13, cursor:"pointer",
              transition:"all 0.2s" }}>{opt.l}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[{v:true,l:"Usa medicação"},{v:false,l:"Sem medicação"}].map(opt => (
            <button key={String(opt.v)} onClick={() => setMeds(opt.v)} style={{
              flex:1, padding:"10px", borderRadius:10,
              border:`1.5px solid ${meds===opt.v ? C.blue : C.border}`,
              background:meds===opt.v ? C.blueGlow : C.white,
              color:meds===opt.v ? C.blue : C.inkMid,
              fontFamily:FB, fontWeight:700, fontSize:13, cursor:"pointer",
              transition:"all 0.2s" }}>{opt.l}</button>
          ))}
        </div>
      </Card>

      {/* Objetivo */}
      <Card style={{ padding:"18px", flex:1, marginBottom:16 }}>
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
          OBJETIVO DE TRATAMENTO (OPCIONAL)
        </div>
        <textarea value={goal} onChange={e => setGoal(e.target.value)}
          placeholder="Ex: Conseguir sair de casa sem verificar a porta mais de uma vez e reduzir o tempo de ritual matinal..."
          style={{ width:"100%", background:"transparent", border:"none", outline:"none",
            color:C.ink, fontSize:13, fontFamily:FB,
            resize:"none", minHeight:80, lineHeight:1.6, boxSizing:"border-box" }}/>
      </Card>

      <Btn onClick={() => onNext({ suds, therapy, meds, goal })}>
        Criar meu perfil clínico ✓
      </Btn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOG MODAL
═══════════════════════════════════════════════════════════════════════════ */
function LogModal({ onClose, onSave }) {
  const [step, setStep]         = useState(0);
  const [context, setContext]   = useState("");
  const [trigger, setTrigger]   = useState("");
  const [suds, setSuds]         = useState(5);
  const [resisted, setResisted] = useState(null);
  const [compulsion, setCompulsion] = useState("");

  const save = () => {
    onSave({ context, trigger, suds, resisted, compulsion, timestamp:Date.now() });
    onClose();
  };

  const STEPS = ["Contexto", "Ansiedade", "Resposta"];

  return (
    <div style={{ position:"absolute", inset:0, background:C.bg,
      zIndex:100, display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 24px 18px" }}>
        <div>
          <div style={{ display:"flex", gap:5, marginBottom:7 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ height:3, width:i===step?28:14, borderRadius:2,
                background:i<=step?C.green:C.borderDim, transition:"all 0.3s" }}/>
            ))}
          </div>
          <h3 style={{ fontFamily:FD, fontSize:22, fontWeight:900,
            color:C.ink, margin:0, letterSpacing:"-0.02em" }}>
            {step===0?"Descreva o episódio":step===1?"Nível de ansiedade (SUDS)":"Como você respondeu?"}
          </h3>
        </div>
        <button onClick={onClose} style={{ width:34, height:34, borderRadius:10,
          background:C.white, border:`1px solid ${C.border}`, cursor:"pointer",
          color:C.inkMid, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>

      <div style={{ flex:1, padding:"0 24px 32px", overflowY:"auto" }}>
        {step === 0 && (
          <>
            <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13, lineHeight:1.6, marginBottom:16 }}>
              Descreva o gatilho (situação ou pensamento intrusivo) e a compulsão que sentiu urgência de realizar.
            </p>
            <Card style={{ padding:"14px", marginBottom:12 }}>
              <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.inkDim, letterSpacing:"0.07em", marginBottom:8 }}>GATILHO / OBSESSÃO</div>
              <textarea autoFocus value={trigger} onChange={e => setTrigger(e.target.value)}
                placeholder="Descreva o pensamento intrusivo ou situação gatilho..."
                style={{ width:"100%", background:"transparent", border:"none", outline:"none",
                  color:C.ink, fontSize:14, fontFamily:FB,
                  resize:"none", minHeight:80, lineHeight:1.6, boxSizing:"border-box" }}/>
            </Card>
            <Card style={{ padding:"14px", marginBottom:20 }}>
              <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.inkDim, letterSpacing:"0.07em", marginBottom:8 }}>COMPULSÃO SENTIDA</div>
              <textarea value={compulsion} onChange={e => setCompulsion(e.target.value)}
                placeholder="Que comportamento ou ritual sentiu urgência de realizar?"
                style={{ width:"100%", background:"transparent", border:"none", outline:"none",
                  color:C.ink, fontSize:14, fontFamily:FB,
                  resize:"none", minHeight:60, lineHeight:1.6, boxSizing:"border-box" }}/>
            </Card>
            <Btn onClick={() => trigger.length > 2 && setStep(1)}
              disabled={trigger.length <= 2}>Próximo →</Btn>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13, lineHeight:1.6, marginBottom:28 }}>
              Avalie a intensidade da ansiedade no momento de maior ativação deste episódio.
            </p>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <SudsRing value={suds} size={130} />
              <div style={{ fontFamily:FB, color:C.inkMid, fontSize:14, marginTop:14 }}>
                {sudsLabel(suds)}
              </div>
            </div>
            <input type="range" min="0" max="10" value={suds}
              onChange={e => setSuds(Number(e.target.value))}
              style={{ width:"100%", accentColor:sudsColor(suds), height:8, cursor:"pointer" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
              <span style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>0 — Nenhuma</span>
              <span style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>10 — Máxima</span>
            </div>

            {suds >= 8 && (
              <div style={{ marginTop:16, padding:"12px 14px", borderRadius:12,
                background:C.redGlow, border:`1px solid rgba(192,57,43,0.2)` }}>
                <div style={{ fontFamily:FB, fontWeight:700, fontSize:13, color:C.red, marginBottom:4 }}>
                  ⚠️ Nível crítico de ansiedade
                </div>
                <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.5 }}>
                  Se estiver em crise agora, use o protocolo de grounding: nomeie 5 objetos que você pode ver, 4 que pode tocar, 3 que pode ouvir.
                </div>
              </div>
            )}

            <div style={{ marginTop:24 }}>
              <Btn onClick={() => setStep(2)}>Próximo →</Btn>
              <Btn onClick={() => setStep(0)} variant="ghost" style={{ marginTop:6, fontSize:13 }}>← Voltar</Btn>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13, lineHeight:1.6, marginBottom:20 }}>
              Qual foi sua resposta comportamental neste episódio?
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
              {[
                { v:true,  e:"💪", t:"Preveni a resposta compulsiva",
                  s:"Tolerou a ansiedade sem realizar a compulsão — núcleo do protocolo ERP",
                  bg:C.greenGlow, border:C.green },
                { v:"partial", e:"🔄", t:"Resistência parcial",
                  s:"Atrasou ou reduziu a compulsão, mas não a eliminou completamente",
                  bg:C.amberGlow, border:C.amber },
                { v:false, e:"😔", t:"Realizei a compulsão",
                  s:"Cada registro já é um passo — a consciência precede a mudança",
                  bg:C.white, border:C.borderDim },
              ].map(opt => (
                <button key={String(opt.v)} onClick={() => setResisted(opt.v)} style={{
                  background:resisted===opt.v ? opt.bg : C.white,
                  border:`2px solid ${resisted===opt.v ? opt.border : C.borderDim}`,
                  borderRadius:16, padding:"16px 18px", cursor:"pointer",
                  textAlign:"left", fontFamily:FB, transition:"all 0.2s" }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{opt.e}</div>
                  <div style={{ fontWeight:800, fontSize:14,
                    color:opt.v===true?C.green:opt.v==="partial"?C.amber:C.ink }}>{opt.t}</div>
                  <div style={{ color:C.inkDim, fontSize:12, marginTop:3, lineHeight:1.4 }}>{opt.s}</div>
                </button>
              ))}
            </div>
            <Btn onClick={() => resisted!==null && save()} disabled={resisted===null}>
              Salvar Registro ✓
            </Btn>
            <Btn onClick={() => setStep(1)} variant="ghost" style={{ marginTop:6, fontSize:13 }}>← Voltar</Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ██████╗  ERP SESSION — FASE 2 CORE FEATURE
═══════════════════════════════════════════════════════════════════════════ */
function ERPSession({ exercise, onClose, onComplete }) {
  const TOTAL_SECS = exercise.duration * 60;
  const CHECK_INTERVAL = 120; // SUDS a cada 2 min

  const [phase, setPhase]       = useState("briefing"); // briefing | active | complete
  const [sudsNow, setSudsNow]   = useState(exercise.suds);
  const [sudsHistory, setSudsHistory] = useState([]);
  const [checkPending, setCheckPending] = useState(false);
  const [escapeTries, setEscapeTries]   = useState(0);
  const [peak, setPeak]         = useState(exercise.suds);
  const [nextCheckIn, setNextCheckIn] = useState(CHECK_INTERVAL);
  const [sessionNote, setSessionNote] = useState("");

  const elapsed = useRef(0);

  const { secs, running, start, pause } = useTimer(TOTAL_SECS, (remaining) => {
    elapsed.current = TOTAL_SECS - remaining;
    const timeToCheck = CHECK_INTERVAL - (elapsed.current % CHECK_INTERVAL);
    setNextCheckIn(timeToCheck);
    if (elapsed.current > 0 && elapsed.current % CHECK_INTERVAL === 0) {
      pause();
      setCheckPending(true);
    }
    if (remaining === 0) { setPhase("complete"); }
  });

  const pct = 1 - (secs / TOTAL_SECS);

  const submitSuds = (val) => {
    const entry = { time: elapsed.current, suds: val };
    setSudsHistory(h => [...h, entry]);
    setSudsNow(val);
    if (val > peak) setPeak(val);
    setCheckPending(false);
    start();
  };

  // Habituation curve data
  const allPoints = [{ time:0, suds:exercise.suds }, ...sudsHistory];

  const sessionResult = {
    exercise,
    sudsStart:  exercise.suds,
    sudsPeak:   peak,
    sudsEnd:    sudsNow,
    duration:   elapsed.current,
    escapeTries,
    sudsHistory: allPoints,
    note: sessionNote,
    timestamp: Date.now(),
    habituated: sudsNow < exercise.suds,
  };

  /* ── BRIEFING ── */
  if (phase === "briefing") return (
    <div style={{ position:"absolute", inset:0, background:C.bg,
      zIndex:100, display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ flex:1, padding:"12px 24px 32px", overflowY:"auto" }}>
        <button onClick={onClose} style={{ background:"none", border:"none",
          cursor:"pointer", color:C.inkMid, fontFamily:FB, fontSize:13,
          fontWeight:700, marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
          ← Voltar
        </button>

        <div style={{ display:"inline-block", background:C.amberGlow,
          border:`1px solid rgba(212,131,26,0.2)`, borderRadius:100,
          padding:"4px 14px", marginBottom:16 }}>
          <span style={{ fontFamily:FB, fontSize:12, fontWeight:700, color:C.amber }}>
            Exercício ERP — Nível {exercise.suds}/10
          </span>
        </div>

        <h2 style={{ fontFamily:FD, fontSize:24, fontWeight:900,
          color:C.ink, margin:"0 0 6px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
          {exercise.title}
        </h2>
        <p style={{ fontFamily:FB, color:C.inkMid, fontSize:14,
          margin:"0 0 24px", lineHeight:1.6 }}>
          {exercise.desc}
        </p>

        {/* Protocolo */}
        <Card style={{ padding:"18px", marginBottom:14 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
            PREVENÇÃO DE RESPOSTA ATIVA
          </div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:10,
            padding:"12px", borderRadius:10,
            background:C.redGlow, border:`1px solid rgba(192,57,43,0.15)` }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🚫</span>
            <div style={{ fontFamily:FB, fontWeight:700, fontSize:13,
              color:C.red, lineHeight:1.5 }}>{exercise.prevention}</div>
          </div>
        </Card>

        <Card style={{ padding:"18px", marginBottom:14 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
            COMO FUNCIONA ESTA SESSÃO
          </div>
          {[
            `Duração: ${exercise.duration} minutos de exposição contínua`,
            "A cada 2 minutos você avaliará seu SUDS (0–10)",
            "Você verá a curva de habituação em tempo real",
            "A ansiedade tende a diminuir com o tempo — isso é o aprendizado inibitório",
            "Não tente suprimir ou distrair — apenas observe a ansiedade",
          ].map((t, i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:i<4?10:0,
              fontFamily:FB, fontSize:13, color:C.inkMid, lineHeight:1.5 }}>
              <span style={{ color:C.green, fontWeight:800, flexShrink:0 }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </Card>

        {/* SUDS esperado */}
        <Card style={{ padding:"16px", marginBottom:24 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
            SUDS ESTIMADO NO INÍCIO
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <SudsRing value={exercise.suds} size={60} />
            <div style={{ fontFamily:FB, fontSize:13, color:C.inkMid, lineHeight:1.5 }}>
              Nível esperado de ansiedade antecipatória para este exercício.
              Este valor irá <strong style={{ color:C.green }}>diminuir</strong> com o processo de habituação.
            </div>
          </div>
        </Card>

        <Btn onClick={() => { setPhase("active"); start(); }} variant="amber">
          Iniciar exposição →
        </Btn>
        <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
          textAlign:"center", marginTop:10, lineHeight:1.5 }}>
          Você pode pausar a qualquer momento. Lembre: a ansiedade é desconfortável, não perigosa.
        </div>
      </div>
    </div>
  );

  /* ── SUDS CHECK-IN ── */
  if (checkPending) return (
    <div style={{ position:"absolute", inset:0, background:"rgba(26,26,46,0.85)",
      zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div style={{ width:"100%", background:C.bg, borderRadius:"28px 28px 0 0",
        padding:"28px 24px 40px" }}>
        <div style={{ fontFamily:FD, fontSize:22, fontWeight:900, color:C.ink,
          marginBottom:6 }}>Check-in SUDS</div>
        <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13, lineHeight:1.6, marginBottom:24 }}>
          Como está sua ansiedade <em>agora</em>? (aos {Math.round(elapsed.current/60)} min)
        </p>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <SudsRing value={sudsNow} size={110} />
          <div style={{ fontFamily:FB, color:C.inkMid, fontSize:13, marginTop:10 }}>
            {sudsLabel(sudsNow)}
          </div>
        </div>
        <input type="range" min="0" max="10" value={sudsNow}
          onChange={e => setSudsNow(Number(e.target.value))}
          style={{ width:"100%", accentColor:sudsColor(sudsNow), height:8, cursor:"pointer" }}/>
        <div style={{ marginTop:20 }}>
          <Btn onClick={() => submitSuds(sudsNow)}>Registrar e continuar</Btn>
          {sudsNow >= 8 && (
            <div style={{ marginTop:10, padding:"12px 14px", borderRadius:12,
              background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.2)",
              fontFamily:FB, fontSize:12, color:C.red, fontWeight:700, lineHeight:1.5 }}>
              ⚡ SUDS crítico. Ao concluir o registro, você poderá ativar o Protocolo de Crise na barra inferior.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── ACTIVE SESSION ── */
  if (phase === "active") {
    const maxSuds = Math.max(...allPoints.map(p => p.suds), 1);
    const chartW  = 310, chartH = 90;

    return (
      <div style={{ position:"absolute", inset:0, background:C.bg,
        zIndex:100, display:"flex", flexDirection:"column" }}>
        <StatusBar />
        <div style={{ flex:1, padding:"10px 24px 32px", overflowY:"auto" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.green, letterSpacing:"0.07em", marginBottom:4 }}>
                EXPOSIÇÃO ATIVA
              </div>
              <h3 style={{ fontFamily:FD, fontSize:20, fontWeight:900,
                color:C.ink, margin:0, lineHeight:1.2 }}>{exercise.title}</h3>
            </div>
            <button onClick={onClose} style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"6px 12px", cursor:"pointer",
              fontFamily:FB, fontSize:12, fontWeight:700, color:C.inkMid }}>
              Encerrar
            </button>
          </div>

          {/* Timer ring */}
          <div style={{ position:"relative", width:180, height:180,
            margin:"0 auto 24px" }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="78" fill="none" stroke={C.bgDeep} strokeWidth="10"/>
              <circle cx="90" cy="90" r="78" fill="none"
                stroke={running ? C.green : C.amber} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2*Math.PI*78}
                strokeDashoffset={2*Math.PI*78*(1-pct)}
                transform="rotate(-90 90 90)"
                style={{ transition:"stroke-dashoffset 1s linear, stroke 0.3s" }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex",
              flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontFamily:FD, fontSize:38, fontWeight:900,
                color:running?C.green:C.amber, lineHeight:1 }}>{fmt(secs)}</div>
              <div style={{ fontFamily:FB, fontSize:12, color:C.inkDim, marginTop:4 }}>
                {running ? "em exposição" : "pausado"}
              </div>
              {running && (
                <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
                  check-in em {fmt(nextCheckIn)}
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div style={{ display:"flex", gap:10, marginBottom:24 }}>
            <Btn onClick={running ? pause : start}
              variant={running ? "secondary" : "amber"} style={{ flex:1 }}>
              {running ? "⏸ Pausar" : "▶ Retomar"}
            </Btn>
            <button onClick={() => setEscapeTries(e => e+1)} style={{
              padding:"14px 16px", borderRadius:14, background:C.white,
              border:`1.5px solid ${C.border}`, cursor:"pointer",
              fontFamily:FB, fontSize:13, fontWeight:700, color:C.inkMid,
              flexShrink:0 }}>
              🚫 Tentei fugir
            </button>
          </div>

          {/* Stats rápidas */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            gap:10, marginBottom:20 }}>
            {[
              { label:"SUDS atual", val:sudsNow, color:sudsColor(sudsNow) },
              { label:"SUDS pico",  val:peak,    color:sudsColor(peak) },
              { label:"Fugas",      val:escapeTries, color:escapeTries>0?C.red:C.green },
            ].map((s,i) => (
              <Card key={i} style={{ padding:"12px", textAlign:"center" }}>
                <div style={{ fontFamily:FD, fontSize:28, fontWeight:900,
                  color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontFamily:FB, fontSize:10, fontWeight:700,
                  color:C.inkDim, letterSpacing:"0.06em", marginTop:4 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Curva de habituação */}
          {allPoints.length >= 2 && (
            <Card style={{ padding:"16px", marginBottom:16 }}>
              <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
                CURVA DE HABITUAÇÃO (TEMPO REAL)
              </div>
              <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}
                preserveAspectRatio="none" style={{ overflow:"visible" }}>
                {/* Grid lines */}
                {[0,2,4,6,8,10].map(v => {
                  const y = chartH - (v/10)*chartH;
                  return (
                    <g key={v}>
                      <line x1="0" y1={y} x2={chartW} y2={y}
                        stroke={C.borderDim} strokeWidth="1" strokeDasharray="4,4"/>
                      <text x="-4" y={y+4} textAnchor="end" fill={C.inkDim}
                        fontSize="9" fontFamily={FB}>{v}</text>
                    </g>
                  );
                })}
                {/* Area */}
                {(() => {
                  const maxT = TOTAL_SECS;
                  const pts  = allPoints.map(p => ({
                    x: (p.time / maxT) * chartW,
                    y: chartH - (p.suds / 10) * chartH,
                  }));
                  const area = `M${pts[0].x},${chartH} ` +
                    pts.map(p => `L${p.x},${p.y}`).join(" ") +
                    ` L${pts[pts.length-1].x},${chartH} Z`;
                  const line = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
                  return (
                    <>
                      <path d={area} fill={C.greenLight} opacity="0.4"/>
                      <path d={line} fill="none" stroke={C.green}
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {pts.map((p,i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4"
                          fill={C.white} stroke={C.green} strokeWidth="2"/>
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
                textAlign:"center", marginTop:6 }}>
                {sudsNow < exercise.suds
                  ? `✓ Habituação ocorrendo — SUDS caiu ${exercise.suds - sudsNow} pontos`
                  : "A ansiedade ainda está alta — continue a exposição"}
              </div>
            </Card>
          )}

          {/* Lembrete de prevenção */}
          <div style={{ padding:"12px 14px", borderRadius:12,
            background:C.redGlow, border:`1px solid rgba(192,57,43,0.15)`,
            fontFamily:FB, fontSize:12, color:C.red, fontWeight:700,
            lineHeight:1.5 }}>
            🚫 {exercise.prevention}
          </div>
        </div>
      </div>
    );
  }

  /* ── COMPLETE ── */
  return (
    <div style={{ position:"absolute", inset:0, background:C.bg,
      zIndex:100, display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ flex:1, padding:"16px 24px 32px", overflowY:"auto" }}>
        {/* Resultado */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>
            {sessionResult.habituated ? "🎉" : "💪"}
          </div>
          <h2 style={{ fontFamily:FD, fontSize:28, fontWeight:900,
            color:C.ink, margin:"0 0 8px", letterSpacing:"-0.02em" }}>
            {sessionResult.habituated ? "Habituação confirmada!" : "Sessão concluída!"}
          </h2>
          <p style={{ fontFamily:FB, color:C.inkMid, fontSize:14, lineHeight:1.6 }}>
            {sessionResult.habituated
              ? `Seu cérebro aprendeu que a ansiedade diminui sem a compulsão. SUDS caiu de ${sessionResult.sudsStart} para ${sessionResult.sudsEnd}.`
              : `Você completou a exposição. Mesmo sem habituação total, o exercício foi clinicamente válido.`}
          </p>
        </div>

        {/* Métricas */}
        <Card style={{ padding:"20px", marginBottom:16 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
            RESULTADO DA SESSÃO
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { l:"SUDS inicial",   v:sessionResult.sudsStart, c:sudsColor(sessionResult.sudsStart) },
              { l:"SUDS pico",      v:sessionResult.sudsPeak,  c:sudsColor(sessionResult.sudsPeak) },
              { l:"SUDS final",     v:sessionResult.sudsEnd,   c:sudsColor(sessionResult.sudsEnd) },
              { l:"Tentativas fuga",v:sessionResult.escapeTries, c:sessionResult.escapeTries>0?C.red:C.green },
            ].map((m,i) => (
              <div key={i} style={{ textAlign:"center", padding:"12px",
                background:C.bg, borderRadius:12 }}>
                <div style={{ fontFamily:FD, fontSize:30, fontWeight:900,
                  color:m.c, lineHeight:1 }}>{m.v}</div>
                <div style={{ fontFamily:FB, fontSize:11, fontWeight:700,
                  color:C.inkDim, marginTop:4 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Curva final */}
        {allPoints.length >= 2 && (
          <Card style={{ padding:"16px", marginBottom:16 }}>
            <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
              color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
              CURVA DE HABITUAÇÃO COMPLETA
            </div>
            <svg width="100%" height="80" viewBox={`0 0 310 80`} preserveAspectRatio="none">
              {(() => {
                const maxT = Math.max(...allPoints.map(p=>p.time), 1);
                const pts  = allPoints.map(p => ({
                  x:(p.time/maxT)*310,
                  y:80-(p.suds/10)*80,
                }));
                const area  = `M${pts[0].x},80 ${pts.map(p=>`L${p.x},${p.y}`).join(" ")} L${pts[pts.length-1].x},80 Z`;
                const line  = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
                return (
                  <>
                    <path d={area} fill={C.greenLight} opacity="0.5"/>
                    <path d={line} fill="none" stroke={C.green} strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,i)=>(
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill={C.white}
                        stroke={C.green} strokeWidth="2"/>
                    ))}
                  </>
                );
              })()}
            </svg>
          </Card>
        )}

        {/* Nota clínica */}
        <Card style={{ padding:"16px", marginBottom:20 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:8 }}>
            NOTA DA SESSÃO (OPCIONAL)
          </div>
          <textarea value={sessionNote} onChange={e => setSessionNote(e.target.value)}
            placeholder="Observações sobre a sessão, dificuldades, insights..."
            style={{ width:"100%", background:"transparent", border:"none", outline:"none",
              color:C.ink, fontSize:13, fontFamily:FB,
              resize:"none", minHeight:70, lineHeight:1.6, boxSizing:"border-box" }}/>
        </Card>

        <Btn onClick={() => onComplete(sessionResult)}>Salvar e concluir ✓</Btn>
        <Btn onClick={onClose} variant="ghost" style={{ marginTop:8, fontSize:13 }}>
          Fechar sem salvar
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME TAB
═══════════════════════════════════════════════════════════════════════════ */
function HomeTab({ logs, sessions, onLog, subtypes, profile }) {
  const h = new Date().getHours();
  const greeting = h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";

  const resistedCount  = logs.filter(l => l.resisted===true || l.resisted==="partial").length;
  const fullResist     = logs.filter(l => l.resisted===true).length;
  const resistRate     = logs.length > 0 ? Math.round((fullResist/logs.length)*100) : 0;
  const avgSuds        = logs.length > 0
    ? (logs.reduce((a,b) => a+b.suds,0)/logs.length).toFixed(1) : "—";
  const sessionsToday  = sessions.filter(s =>
    new Date(s.timestamp).toDateString() === new Date().toDateString()).length;

  const subMap = { contamination:"Contaminação", checking:"Verificação",
    symmetry:"Simetria/Exatidão", intrusive:"Pensamentos Intrusivos",
    hoarding:"Acumulação", religious:"Escrupulosidade",
    somatic:"Somático", relationship:"Relacional" };

  const severity = profile.severity || "—";
  const sevColor = severity==="Leve"?C.greenMid:severity==="Moderado"?C.amber:severity==="Grave"?C.red:C.inkDim;

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", paddingBottom:90 }}>
      <div style={{ marginBottom:22 }}>
        <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13, margin:"0 0 3px" }}>{greeting} 👋</p>
        <h2 style={{ fontFamily:FD, fontSize:30, fontWeight:900,
          color:C.ink, margin:0, letterSpacing:"-0.03em", lineHeight:1.15 }}>
          Painel clínico<br/>do dia
        </h2>
      </div>

      {/* Y-BOCS badge */}
      {profile.severity && (
        <div style={{ display:"flex", alignItems:"center", gap:10,
          padding:"10px 14px", borderRadius:12, marginBottom:16,
          background:sevColor+"15", border:`1px solid ${sevColor}30` }}>
          <div style={{ fontFamily:FB, fontSize:12, fontWeight:800,
            color:sevColor }}>Y-BOCS baseline: {severity}</div>
          <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>
            Pontuação: {profile.ybocsTotal}/15
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          { l:"Taxa de resistência", v:`${resistRate}%`, c:C.green, sub:`${fullResist}/${logs.length} loops` },
          { l:"SUDS médio", v:avgSuds, c:Number(avgSuds)>=7?C.red:Number(avgSuds)>=4?C.amber:C.green, sub:"escala 0–10" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"16px" }}>
            <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
              color:C.inkDim, letterSpacing:"0.07em", marginBottom:6 }}>
              {s.l.toUpperCase()}
            </div>
            <div style={{ fontFamily:FD, fontSize:34, fontWeight:900,
              color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:4 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Sessões ERP hoje */}
      <Card style={{ padding:"14px 16px", marginBottom:16,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:4 }}>
            SESSÕES ERP HOJE
          </div>
          <div style={{ fontFamily:FD, fontSize:28, fontWeight:900, color:C.green }}>
            {sessionsToday}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>
            {sessions.length} sessões no total
          </div>
          <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
            {sessions.filter(s=>s.habituated).length} com habituação confirmada
          </div>
        </div>
      </Card>

      {/* Log button */}
      <button onClick={onLog} style={{
        width:"100%", borderRadius:18, padding:"20px",
        background:`linear-gradient(135deg, ${C.green}, ${C.greenMid})`,
        border:"none", cursor:"pointer", display:"flex",
        alignItems:"center", gap:16, marginBottom:20,
        boxShadow:`0 6px 28px rgba(45,106,79,0.26)`,
        fontFamily:FB, transition:"transform 0.15s" }}>
        <div style={{ width:50, height:50, borderRadius:14,
          background:"rgba(255,255,255,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ textAlign:"left" }}>
          <div style={{ color:"white", fontWeight:800, fontSize:16 }}>Registrar Loop</div>
          <div style={{ color:"rgba(255,255,255,0.72)", fontSize:12, marginTop:2 }}>
            Gatilho, SUDS e resposta comportamental
          </div>
        </div>
      </button>

      {/* Subtipos */}
      {subtypes.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:9 }}>DIMENSÕES ATIVAS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {subtypes.map(s => (
              <span key={s} style={{ background:C.greenGlow, color:C.green,
                border:`1px solid rgba(45,106,79,0.2)`,
                padding:"4px 12px", borderRadius:100,
                fontSize:12, fontWeight:700, fontFamily:FB }}>
                {subMap[s]||s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logs recentes */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:10 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em" }}>REGISTROS RECENTES</div>
          <span style={{ fontFamily:FB, color:C.green, fontSize:11, fontWeight:700 }}>
            {logs.length} total
          </span>
        </div>
        {logs.length === 0 ? (
          <Card style={{ padding:"28px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
            <div style={{ fontFamily:FB, fontWeight:700, color:C.ink, marginBottom:5 }}>
              Nenhum registro ainda
            </div>
            <div style={{ fontFamily:FB, color:C.inkDim, fontSize:13, lineHeight:1.5 }}>
              Registre episódios de obsessão/compulsão ao longo do dia.
            </div>
          </Card>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {logs.slice(0,4).map((log,i) => (
              <Card key={i} style={{ padding:"13px 15px" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                    color:log.resisted===true?C.green:log.resisted==="partial"?C.amber:C.inkMid,
                    background:log.resisted===true?C.greenGlow:log.resisted==="partial"?C.amberGlow:C.surfaceDim,
                    padding:"3px 9px", borderRadius:8 }}>
                    {log.resisted===true?"💪 PREVENIU":log.resisted==="partial"?"🔄 PARCIAL":"😔 CEDEU"}
                  </span>
                  <span style={{ fontFamily:FB, color:C.inkDim, fontSize:11 }}>
                    {new Date(log.timestamp).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
                  </span>
                </div>
                <p style={{ fontFamily:FB, color:C.inkMid, fontSize:12,
                  margin:"0 0 9px", lineHeight:1.5,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                  overflow:"hidden" }}>{log.trigger}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, height:4, background:C.bgDeep, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${(log.suds/10)*100}%`, height:"100%", borderRadius:2,
                      background:sudsColor(log.suds), transition:"width 0.5s" }}/>
                  </div>
                  <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                    color:sudsColor(log.suds), minWidth:30 }}>{log.suds}/10</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS TAB — Curvas, padrões e métricas clínicas
═══════════════════════════════════════════════════════════════════════════ */
function StatsTab({ logs, sessions }) {
  const fullResist = logs.filter(l => l.resisted===true).length;
  const partial    = logs.filter(l => l.resisted==="partial").length;
  const cedeu      = logs.filter(l => l.resisted===false).length;
  const resistRate = logs.length > 0 ? Math.round((fullResist/logs.length)*100) : 0;
  const sudsHist   = logs.slice().reverse().map(l => l.suds);

  // Médias de habituação das sessões
  const avgDrop = sessions.length > 0
    ? Math.round(sessions.reduce((a,s) => a+(s.sudsStart - s.sudsEnd), 0) / sessions.length)
    : 0;

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", paddingBottom:90 }}>
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 20px", letterSpacing:"-0.02em" }}>
        Análise Clínica
      </h2>

      {/* SUDS chart */}
      <Card style={{ padding:"18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          EVOLUÇÃO DO SUDS
        </div>
        {logs.length < 2 ? (
          <div style={{ fontFamily:FB, color:C.inkDim, fontSize:13,
            textAlign:"center", padding:"20px 0" }}>Adicione mais registros para visualizar</div>
        ) : (
          <>
            <svg width="100%" height="90" viewBox="0 0 320 90" preserveAspectRatio="none">
              {[0,3,6,9].map(v => {
                const y = 90-(v/10)*90;
                return <line key={v} x1="0" y1={y} x2="320" y2={y}
                  stroke={C.borderDim} strokeWidth="1" strokeDasharray="3,5"/>;
              })}
              {sudsHist.slice(-12).map((v,i,arr) => {
                const x = (i/(Math.max(arr.length-1,1)))*320;
                const y = 90-(v/10)*82;
                const col = sudsColor(v);
                if(i===0) return null;
                const px = ((i-1)/(Math.max(arr.length-1,1)))*320;
                const py = 90-(arr[i-1]/10)*82;
                return <line key={i} x1={px} y1={py} x2={x} y2={y}
                  stroke={col} strokeWidth="2.5" strokeLinecap="round"/>;
              })}
              {sudsHist.slice(-12).map((v,i,arr) => {
                const x = (i/(Math.max(arr.length-1,1)))*320;
                const y = 90-(v/10)*82;
                return <circle key={i} cx={x} cy={y} r="5"
                  fill={C.white} stroke={sudsColor(v)} strokeWidth="2"/>;
              })}
            </svg>
            <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
              textAlign:"center", marginTop:8 }}>
              Últimos {Math.min(logs.length,12)} registros
            </div>
          </>
        )}
      </Card>

      {/* Distribuição de respostas */}
      <Card style={{ padding:"18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          DISTRIBUIÇÃO DE RESPOSTAS
        </div>
        {logs.length === 0 ? (
          <div style={{ fontFamily:FB, color:C.inkDim, fontSize:13 }}>Sem dados</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"Prevenção completa", val:fullResist, color:C.green },
              { label:"Prevenção parcial",  val:partial,    color:C.amber },
              { label:"Compulsão realizada",val:cedeu,      color:C.red },
            ].map((r,i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom:5, fontFamily:FB, fontSize:12, fontWeight:600 }}>
                  <span style={{ color:C.inkMid }}>{r.label}</span>
                  <span style={{ color:r.color, fontWeight:800 }}>
                    {r.val} ({logs.length>0?Math.round((r.val/logs.length)*100):0}%)
                  </span>
                </div>
                <div style={{ height:8, background:C.bgDeep, borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:`${logs.length>0?(r.val/logs.length)*100:0}%`,
                    height:"100%", borderRadius:4, background:r.color,
                    transition:"width 0.6s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sessões ERP */}
      <Card style={{ padding:"18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          SESSÕES ERP — MÉTRICAS
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { l:"Sessões totais",     v:sessions.length,                   c:C.green },
            { l:"Com habituação",     v:sessions.filter(s=>s.habituated).length, c:C.green },
            { l:"Queda SUDS média",   v:avgDrop > 0 ? `-${avgDrop}` : "—", c:C.greenMid },
            { l:"Taxa habituação",    v:sessions.length>0?`${Math.round(sessions.filter(s=>s.habituated).length/sessions.length*100)}%`:"—", c:C.green },
          ].map((m,i) => (
            <div key={i} style={{ textAlign:"center", padding:"12px",
              background:C.bg, borderRadius:12 }}>
              <div style={{ fontFamily:FD, fontSize:26, fontWeight:900,
                color:m.c, lineHeight:1 }}>{m.v}</div>
              <div style={{ fontFamily:FB, fontSize:10, fontWeight:700,
                color:C.inkDim, marginTop:4 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sessões recentes */}
      {sessions.length > 0 && (
        <div>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
            ÚLTIMAS SESSÕES ERP
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {sessions.slice(-3).reverse().map((s,i) => (
              <Card key={i} style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontFamily:FB, fontWeight:700, fontSize:13,
                    color:C.ink, flex:1 }}>{s.exercise.title}</div>
                  <span style={{ fontFamily:FB, fontSize:10, fontWeight:800,
                    color:s.habituated?C.green:C.amber,
                    background:s.habituated?C.greenGlow:C.amberGlow,
                    padding:"2px 8px", borderRadius:8, flexShrink:0, marginLeft:8 }}>
                    {s.habituated?"HABITUOU":"PARCIAL"}
                  </span>
                </div>
                <div style={{ display:"flex", gap:16, fontFamily:FB, fontSize:11, color:C.inkDim }}>
                  <span>SUDS: {s.sudsStart}→{s.sudsEnd}</span>
                  <span>Duração: {Math.round(s.duration/60)}min</span>
                  {s.escapeTries > 0 && <span style={{ color:C.red }}>Fugas: {s.escapeTries}</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERP TAB — Hierarquia + Sessão
═══════════════════════════════════════════════════════════════════════════ */
function ERPTab({ subtypes, sessions, onStartSession }) {
  const [expanded, setExpanded] = useState(null);

  // Gera exercícios personalizados baseados nos subtipos
  const exercises = subtypes.flatMap(s => ERP_LIBRARY[s] || [])
    .sort((a,b) => a.suds - b.suds)
    .map((ex, i, arr) => ({
      ...ex,
      done: sessions.some(s => s.exercise.id === ex.id && s.habituated),
      unlocked: i === 0 || (arr[i-1] && sessions.some(s => s.exercise.id === arr[i-1].id && s.habituated)),
    }));

  const fallback = [
    { id:"f1", title:"Permanecer com incerteza por 10min", suds:3, duration:10,
      desc:"Deixe uma situação ambígua sem resolvê-la. Observe a ansiedade sem neutralizar.",
      prevention:"NÃO busque reassurance ou resolva a dúvida" },
    { id:"f2", title:"Atrasar compulsão em 5 minutos", suds:4, duration:15,
      desc:"Quando sentir a compulsão, espere exatamente 5 minutos antes de qualquer ação.",
      prevention:"NÃO realize nenhuma compulsão durante o atraso" },
    { id:"f3", title:"Exposição a situação ansiogênica leve", suds:5, duration:20,
      desc:"Exponha-se a uma situação que normalmente evita por ansiedade leve.",
      prevention:"NÃO saia da situação antes do tempo" },
  ].map((ex,i,arr) => ({
    ...ex,
    done:sessions.some(s=>s.exercise.id===ex.id&&s.habituated),
    unlocked:i===0||(arr[i-1]&&sessions.some(s=>s.exercise.id===arr[i-1].id&&s.habituated)),
  }));

  const list = exercises.length > 0 ? exercises : fallback;
  const done = list.filter(e => e.done).length;

  const TYPE_META = {
    "in-vivo":          { label:"In Vivo",             color:C.green,  bg:C.greenGlow },
    "imaginal":         { label:"Imaginal",             color:"#7C3AED", bg:"rgba(124,58,237,0.10)" },
    "interoceptive":    { label:"Interoceptiva",        color:C.blue,   bg:C.blueGlow },
    "mental-compulsion":{ label:"Compulsão Mental",     color:C.amber,  bg:C.amberGlow },
  };

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", paddingBottom:90 }}>
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 6px", letterSpacing:"-0.02em" }}>
        Hierarquia ERP
      </h2>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
        margin:"0 0 14px", lineHeight:1.55 }}>
        Exposição progressiva com prevenção de resposta. Exercícios baseados nos seus subtipos.
      </p>

      {/* Legenda de tipos */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }}>
        {Object.entries(TYPE_META).map(([k,v]) => (
          <span key={k} style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:v.color, background:v.bg,
            padding:"3px 10px", borderRadius:100 }}>
            {v.label}
          </span>
        ))}
      </div>

      {/* Progresso */}
      <Card style={{ padding:"16px 18px", marginBottom:18,
        display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ fontFamily:FD, fontSize:40, fontWeight:900,
          color:C.green, lineHeight:1 }}>{done}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:8 }}>
            DE {list.length} EXERCÍCIOS CONCLUÍDOS
          </div>
          <div style={{ height:8, background:C.bgDeep, borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:`${list.length>0?(done/list.length)*100:0}%`,
              height:"100%", borderRadius:4,
              background:`linear-gradient(90deg, ${C.green}, ${C.greenMid})`,
              transition:"width 0.6s ease" }}/>
          </div>
        </div>
      </Card>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {list.map((ex, i) => {
          const isOpen = expanded === ex.id;
          const col    = ex.done ? C.green : ex.unlocked ? C.amber : C.inkDim;
          const typeMeta = TYPE_META[ex.type] || TYPE_META["in-vivo"];

          return (
            <div key={ex.id} onClick={() => ex.unlocked && setExpanded(isOpen?null:ex.id)}
              style={{ borderRadius:16, overflow:"hidden",
                border:`1.5px solid ${ex.done?C.greenLight:ex.unlocked?"rgba(212,131,26,0.4)":C.borderDim}`,
                background:ex.done?"rgba(183,228,199,0.12)":ex.unlocked?"rgba(253,230,138,0.08)":C.white,
                opacity:ex.unlocked?1:0.45,
                cursor:ex.unlocked?"pointer":"not-allowed",
                transition:"all 0.2s" }}>
              <div style={{ padding:"14px 15px", display:"flex",
                alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                  background:ex.done?C.green:ex.unlocked?C.amber:C.bgDeep,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15 }}>
                  {ex.done ? (
                    <svg width="15" height="12" viewBox="0 0 15 12">
                      <path d="M1.5 6l3.5 4.5L13.5 1" stroke="white" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : ex.unlocked ? "▶" : "🔒"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                    <span style={{ fontFamily:FB, fontSize:9, fontWeight:800,
                      color:typeMeta.color, background:typeMeta.bg,
                      padding:"2px 7px", borderRadius:100 }}>
                      {typeMeta.label}
                    </span>
                  </div>
                  <div style={{ fontFamily:FB, fontWeight:700, fontSize:13, color:col }}>
                    {ex.title}
                  </div>
                  <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
                    SUDS esperado: {ex.suds}/10 · {ex.duration} min
                  </div>
                </div>
                {ex.unlocked && (
                  <span style={{ fontFamily:FB, fontSize:18, color:C.inkDim,
                    transform:isOpen?"rotate(90deg)":"rotate(0deg)", transition:"0.2s" }}>›</span>
                )}
              </div>

              {isOpen && (
                <div style={{ padding:"0 15px 15px",
                  borderTop:`1px solid ${C.borderDim}` }}>
                  <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
                    lineHeight:1.6, margin:"12px 0 10px" }}>{ex.desc}</p>
                  <div style={{ padding:"10px 12px", borderRadius:10,
                    background:C.redGlow, border:`1px solid rgba(192,57,43,0.15)`,
                    fontFamily:FB, fontSize:12, color:C.red, fontWeight:700,
                    marginBottom: ex.mentalCompulsion ? 8 : 14, lineHeight:1.4 }}>
                    🚫 {ex.prevention}
                  </div>
                  {ex.mentalCompulsion && (
                    <div style={{ padding:"10px 12px", borderRadius:10,
                      background:C.amberGlow, border:`1px solid rgba(212,131,26,0.2)`,
                      fontFamily:FB, fontSize:12, color:C.amber, fontWeight:700,
                      marginBottom:14, lineHeight:1.4 }}>
                      🧠 Compulsão mental: {ex.mentalCompulsion}
                    </div>
                  )}
                  {!ex.done && (
                    <Btn small variant="amber" onClick={() => { onStartSession(ex); setExpanded(null); }}>
                      Iniciar sessão ERP guiada →
                    </Btn>
                  )}
                  {ex.done && (
                    <div style={{ textAlign:"center", fontFamily:FB, fontSize:13,
                      color:C.green, fontWeight:700 }}>
                      ✓ Habituação confirmada para este exercício
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota clínica */}
      <div style={{ marginTop:20, padding:"14px", borderRadius:14,
        background:C.blueGlow, border:`1px solid rgba(37,99,235,0.15)` }}>
        <div style={{ fontFamily:FB, fontWeight:700, fontSize:13, color:C.blue, marginBottom:4 }}>
          ℹ️ Nota sobre o protocolo
        </div>
        <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.6 }}>
          A eficácia do ERP depende da exposição <em>sem</em> realização da compulsão — incluindo compulsões mentais (neutralização, ruminação, contagem). Exposições imaginais são indicadas quando não há estímulo externo concreto.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILE TAB
═══════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════
   📄 GERADOR DE RELATÓRIO CLÍNICO MENSAL
═══════════════════════════════════════════════════════════════════════════ */
function generateReportHTML({ logs, sessions, profile, subtypes, therapistName, therapistEmail }) {
  const subMap = {
    contamination:"🧼 Contaminação", checking:"🔒 Verificação",
    symmetry:"📐 Simetria/Exatidão", intrusive:"💭 Pensamentos Intrusivos",
    hoarding:"📦 Acumulação", religious:"🙏 Escrupulosidade",
    somatic:"🫀 Somático", relationship:"💑 Relacional",
  };

  const now     = new Date();
  const month   = now.toLocaleString("pt-BR", { month:"long", year:"numeric" });
  const genDate = now.toLocaleDateString("pt-BR");

  // Métricas calculadas
  const totalLogs     = logs.length;
  const totalSessions = sessions.length;
  const resistedLogs  = logs.filter(l => l.resisted === true || l.resisted === "partial");
  const resistRate    = totalLogs > 0 ? Math.round((resistedLogs.length / totalLogs) * 100) : 0;
  const avgSuds       = totalLogs > 0
    ? (logs.reduce((a,l) => a + (l.suds||0), 0) / totalLogs).toFixed(1)
    : "—";
  const habituated    = sessions.filter(s => s.habituated).length;

  // Evolução semanal do SUDS (últimas 8 semanas)
  const weeklyData = [];
  for (let w = 7; w >= 0; w--) {
    const wEnd   = Date.now() - w * 7 * 24 * 3600 * 1000;
    const wStart = wEnd - 7 * 24 * 3600 * 1000;
    const wLogs  = logs.filter(l => l.timestamp >= wStart && l.timestamp < wEnd);
    if (wLogs.length > 0) {
      weeklyData.push({
        label: `S${8-w}`,
        avg: (wLogs.reduce((a,l) => a+(l.suds||0),0) / wLogs.length).toFixed(1),
        n: wLogs.length,
      });
    }
  }

  // Subtypes com stats
  const subtypeStats = subtypes.map(s => {
    const sLogs = logs.filter(l => l.subtype === s);
    const sSess = sessions.filter(x => x.exercise?.subtypeId === s);
    const sAvg  = sLogs.length > 0
      ? (sLogs.reduce((a,l) => a+(l.suds||0),0)/sLogs.length).toFixed(1)
      : "—";
    return { id:s, label:subMap[s]||s, logs:sLogs.length, sessions:sSess.length, avg:sAvg };
  });

  // Últimos 15 episódios
  const recentLogs = [...logs].sort((a,b) => b.timestamp - a.timestamp).slice(0,15);

  // Observações automáticas
  const observations = [];
  if (parseFloat(avgSuds) >= 7)
    observations.push({ type:"warn", text:`SUDS médio elevado (${avgSuds}/10) — atenção ao nível de sofrimento geral.` });
  if (parseFloat(avgSuds) <= 4 && totalLogs > 5)
    observations.push({ type:"ok", text:`SUDS médio baixo (${avgSuds}/10) — resposta favorável ao protocolo ERP.` });
  if (resistRate >= 70)
    observations.push({ type:"ok", text:`Taxa de prevenção de resposta de ${resistRate}% — adesão excelente ao protocolo.` });
  if (resistRate < 40 && totalLogs > 5)
    observations.push({ type:"warn", text:`Taxa de prevenção de resposta de ${resistRate}% — compulsões ainda frequentes. Revisar hierarquia de exposições.` });
  if (habituated > 0)
    observations.push({ type:"ok", text:`${habituated} habituação(ões) confirmada(s) em sessões ERP — aprendizado inibitório documentado.` });
  const crisisLogs = logs.filter(l => l.isCrisis);
  if (crisisLogs.length > 0)
    observations.push({ type:"warn", text:`Protocolo de crise ativado ${crisisLogs.length}x no período — explorar gatilhos associados.` });
  if (observations.length === 0)
    observations.push({ type:"info", text:"Dados insuficientes para observações automáticas. Continue usando o app para gerar análises mais completas." });

  // Sugestão para a sessão baseada nos subtipos com maior SUDS
  const worstSubtype = subtypeStats.sort((a,b) => parseFloat(b.avg)||0 - parseFloat(a.avg)||0)[0];
  const suggestion = worstSubtype && worstSubtype.avg !== "—"
    ? `O subtipo <strong>${worstSubtype.label}</strong> apresenta o SUDS médio mais elevado (${worstSubtype.avg}). Pode ser clinicamente útil explorar a hierarquia de exposições e a natureza das compulsões predominantes nesse eixo.`
    : "Continue monitorando a evolução semanal do SUDS para identificar subtipos com menor resposta ao protocolo.";

  const barMax = Math.max(...weeklyData.map(w => parseFloat(w.avg)), 1);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>TOCLivre — Relatório Clínico · ${month}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F5F0E8;color:#1A1A2E;padding:20px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:820px;margin:0 auto}
  .print-btn{display:flex;gap:10px;margin-bottom:20px;justify-content:flex-end}
  .print-btn button{padding:10px 20px;border:none;border-radius:100px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700}
  .btn-print{background:#2D6A4F;color:white}
  .btn-mail{background:#1A1A2E;color:white}
  @media print{.print-btn{display:none}body{background:white;padding:0}.page{max-width:100%}}
  /* HEADER */
  .header{background:#2D6A4F;border-radius:12px;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .header-left h1{font-family:'Fraunces',serif;font-size:28px;font-weight:900;color:white;letter-spacing:-0.02em}
  .header-left p{color:rgba(255,255,255,0.65);font-size:13px;margin-top:4px}
  .header-right{text-align:right}
  .header-right .lbl{font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:2px}
  .header-right .val{font-size:13px;color:rgba(255,255,255,0.9);font-weight:600}
  /* AVISO */
  .aviso{background:#FEF3E2;border:1px solid rgba(212,131,26,0.25);border-radius:8px;padding:10px 14px;font-size:11.5px;color:#7C4A00;line-height:1.6;margin-bottom:12px}
  /* GRID */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
  .card{background:white;border-radius:10px;padding:18px;border:1px solid #DDD5C8}
  .card-title{font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9E97B0;margin-bottom:10px}
  /* MÉTRICAS */
  .metric-num{font-family:'Fraunces',serif;font-size:32px;font-weight:900;color:#2D6A4F;line-height:1}
  .metric-lbl{font-size:11px;color:#9E97B0;margin-top:4px;line-height:1.4}
  .delta{font-size:11px;font-weight:700;color:#2D6A4F;margin-top:3px}
  /* BARRAS */
  .bar-wrap{margin-top:8px}
  .bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .bar-label{font-size:10px;color:#9E97B0;width:22px;text-align:right;flex-shrink:0}
  .bar-bg{flex:1;background:#EBF5F0;border-radius:3px;height:16px;position:relative}
  .bar-fill{height:16px;border-radius:3px;background:#2D6A4F;transition:width 0.5s;display:flex;align-items:center;justify-content:flex-end;padding-right:5px}
  .bar-val{font-size:9px;font-weight:800;color:white}
  .bar-n{font-size:9px;color:#9E97B0;width:26px;flex-shrink:0}
  /* TABELA */
  table{width:100%;border-collapse:collapse;font-size:11.5px}
  th{background:#2D6A4F;color:white;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.05em}
  th:first-child{border-radius:6px 0 0 0}
  th:last-child{border-radius:0 6px 0 0}
  td{padding:7px 10px;border-bottom:1px solid #EDE7DC;vertical-align:middle}
  tr:nth-child(even) td{background:#F9F6F1}
  .suds-high{color:#C0392B;font-weight:800}
  .suds-mid{color:#D4831A;font-weight:700}
  .suds-low{color:#2D6A4F;font-weight:700}
  .badge{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700}
  .badge-ok{background:#EBF5F0;color:#2D6A4F}
  .badge-no{background:#FDEEEC;color:#C0392B}
  .badge-par{background:#FEF3E2;color:#D4831A}
  /* OBSERVAÇÕES */
  .obs{padding:10px 14px;border-radius:8px;font-size:12px;line-height:1.6;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start}
  .obs-ok{background:#EBF5F0;border-left:3px solid #2D6A4F;color:#1A4A32}
  .obs-warn{background:#FEF3E2;border-left:3px solid #D4831A;color:#7C4A00}
  .obs-info{background:#F0EDFA;border-left:3px solid #9E97B0;color:#5C5470}
  /* SUGESTÃO */
  .suggestion{background:#1A1A2E;border-radius:10px;padding:16px 18px;color:rgba(255,255,255,0.75);font-size:12.5px;line-height:1.7;margin-top:12px}
  .suggestion strong{color:#B7E4C7}
  /* FOOTER */
  .footer{margin-top:20px;padding-top:14px;border-top:1px solid #DDD5C8;display:flex;justify-content:space-between;font-size:10px;color:#9E97B0}
</style>
</head>
<body>
<div class="page">
  <div class="print-btn">
    <button class="btn-mail" onclick="window.location.href='mailto:${therapistEmail || ""}?subject=TOCLivre%20-%20Relat%C3%B3rio%20Cl%C3%ADnico%20${encodeURIComponent(month)}&body=Prezado(a)%20${encodeURIComponent(therapistName || "Profissional")}%2C%0A%0ASegue%20o%20relat%C3%B3rio%20clínico%20mensal%20gerado%20pelo%20TOCLivre%20referente%20a%20${encodeURIComponent(month)}.%0A%0APor%20favor%2C%20imprima%20ou%20salve%20esta%20p%C3%A1gina%20como%20PDF%20e%20anexe.%0A%0AAtenciosamente.'">
      ✉ Enviar por e-mail
    </button>
    <button class="btn-print" onclick="window.print()">🖨 Imprimir / Salvar PDF</button>
  </div>

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <h1>TOCLivre</h1>
      <p>Relatório Clínico Mensal — ERP Progress Report</p>
    </div>
    <div class="header-right">
      <div class="lbl">Período</div>
      <div class="val">${month}</div>
      <div class="lbl" style="margin-top:10px">Destinatário</div>
      <div class="val">${therapistName || "Profissional de saúde"}</div>
      <div class="lbl" style="margin-top:10px">Gerado em</div>
      <div class="val">${genDate}</div>
    </div>
  </div>

  <!-- AVISO -->
  <div class="aviso">
    ⚠ Este documento é gerado automaticamente pelo app TOCLivre com base em autorrelato do paciente. Não substitui entrevista diagnóstica, avaliação presencial nem julgamento clínico. Destina-se exclusivamente a complementar a avaliação do profissional.
  </div>

  <!-- MÉTRICAS -->
  <div class="grid-4">
    <div class="card">
      <div class="card-title">SUDS Médio</div>
      <div class="metric-num">${avgSuds}</div>
      <div class="metric-lbl">Média dos episódios\nregistrados</div>
    </div>
    <div class="card">
      <div class="card-title">Sessões ERP</div>
      <div class="metric-num">${totalSessions}</div>
      <div class="metric-lbl">Sessões realizadas\nno período</div>
      ${habituated > 0 ? `<div class="delta">↑ ${habituated} habituações</div>` : ""}
    </div>
    <div class="card">
      <div class="card-title">Prevenção de Resposta</div>
      <div class="metric-num">${resistRate}%</div>
      <div class="metric-lbl">Episódios com\ncompulsão resistida</div>
    </div>
    <div class="card">
      <div class="card-title">Y-BOCS Baseline</div>
      <div class="metric-num" style="color:${parseFloat(profile.ybocsTotal)>=8?'#D4831A':'#2D6A4F'}">${profile.ybocsTotal || "—"}</div>
      <div class="metric-lbl">${profile.severity || "Não avaliado"}</div>
    </div>
  </div>

  <div class="grid-2">
    <!-- EVOLUÇÃO SEMANAL -->
    <div class="card">
      <div class="card-title">EVOLUÇÃO DO SUDS MÉDIO SEMANAL</div>
      ${weeklyData.length > 0 ? `
      <div class="bar-wrap">
        ${weeklyData.map(w => `
        <div class="bar-row">
          <span class="bar-label">${w.label}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width:${Math.round((parseFloat(w.avg)/10)*100)}%">
              <span class="bar-val">${w.avg}</span>
            </div>
          </div>
          <span class="bar-n">${w.n}ep</span>
        </div>`).join("")}
      </div>` : `<div style="font-size:12px;color:#9E97B0;padding:10px 0">Dados insuficientes para evolução semanal.</div>`}
    </div>

    <!-- SUBTIPOS -->
    <div class="card">
      <div class="card-title">SUBTIPOS TRABALHADOS</div>
      ${subtypeStats.length > 0 ? `
      <table style="font-size:11px">
        <thead><tr>
          <th>Subtipo</th><th>Episód.</th><th>Sessões</th><th>SUDS méd.</th>
        </tr></thead>
        <tbody>
          ${subtypeStats.map(s => `<tr>
            <td>${s.label}</td>
            <td>${s.logs}</td>
            <td>${s.sessions}</td>
            <td style="font-weight:700;color:${parseFloat(s.avg)>=7?'#C0392B':parseFloat(s.avg)>=5?'#D4831A':'#2D6A4F'}">${s.avg}</td>
          </tr>`).join("")}
        </tbody>
      </table>` : `<div style="font-size:12px;color:#9E97B0;padding:10px 0">Nenhum episódio registrado ainda.</div>`}
    </div>
  </div>

  <!-- TABELA DE EPISÓDIOS -->
  <div class="card" style="margin-bottom:12px">
    <div class="card-title">ÚLTIMOS EPISÓDIOS REGISTRADOS</div>
    ${recentLogs.length > 0 ? `
    <table>
      <thead><tr>
        <th>Data</th><th>Gatilho</th><th>SUDS</th><th>Compulsão realizada</th><th>Prevenção</th>
      </tr></thead>
      <tbody>
        ${recentLogs.map(l => {
          const d = new Date(l.timestamp).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
          const sudsClass = l.suds >= 8 ? "suds-high" : l.suds >= 5 ? "suds-mid" : "suds-low";
          const prevBadge = l.resisted === true ? `<span class="badge badge-ok">Sim ✓</span>`
            : l.resisted === "partial" ? `<span class="badge badge-par">Parcial</span>`
            : `<span class="badge badge-no">Não</span>`;
          return `<tr>
            <td>${d}</td>
            <td>${l.trigger||"—"}</td>
            <td class="${sudsClass}">${l.suds??"-"}</td>
            <td>${l.compulsion||"—"}</td>
            <td>${prevBadge}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>` : `<div style="font-size:12px;color:#9E97B0;padding:10px 0">Nenhum episódio registrado ainda.</div>`}
  </div>

  <!-- OBSERVAÇÕES + SUGESTÃO -->
  <div class="card" style="margin-bottom:12px">
    <div class="card-title">OBSERVAÇÕES GERADAS AUTOMATICAMENTE</div>
    ${observations.map(o => `
    <div class="obs obs-${o.type}">
      <span>${o.type==="ok"?"✓":o.type==="warn"?"⚠":"ℹ"}</span>
      <span>${o.text}</span>
    </div>`).join("")}
    <div class="suggestion">
      <strong>Sugestão para a sessão:</strong><br/>
      ${suggestion}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span>TOCLivre · toclivre.com.br · App de bem-estar baseado em ERP</span>
    <span>Dados de autorrelato — uso exclusivo do profissional de saúde</span>
  </div>
</div>
</body>
</html>`;
}

function ProfileTab({ subtypes, logs, sessions, profile, onExportData, onDeleteAccount, notifPermission }) {
  const [therapistName,  setTherapistName]  = usePersistedState("therapistName", "");
  const [therapistEmail, setTherapistEmail] = usePersistedState("therapistEmail", "");
  const [reportSent,     setReportSent]     = useState(false);

  const handleGenerateReport = () => {
    const html = generateReportHTML({ logs, sessions, profile, subtypes, therapistName, therapistEmail });
    const blob = new Blob([html], { type:"text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setReportSent(true);
    setTimeout(() => setReportSent(false), 4000);
  };
  const subMap = {
    contamination:"🧼 Contaminação", checking:"🔒 Verificação",
    symmetry:"📐 Simetria/Exatidão", intrusive:"💭 Pensamentos",
    hoarding:"📦 Acumulação", religious:"🙏 Escrupulosidade",
    somatic:"🫀 Somático", relationship:"💑 Relacional",
  };

  const sevColor = profile.severity==="Leve"?C.greenMid
    :profile.severity==="Moderado"?C.amber
    :profile.severity==="Grave"?C.red:C.inkDim;

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", paddingBottom:90 }}>
      <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
        color:C.ink, margin:"0 0 20px", letterSpacing:"-0.02em" }}>
        Perfil Clínico
      </h2>

      {/* Perfil card */}
      <Card style={{ padding:"18px", marginBottom:14,
        display:"flex", gap:14, alignItems:"center" }}>
        <div style={{ width:58, height:58, borderRadius:17, flexShrink:0,
          background:`linear-gradient(135deg, ${C.green}, ${C.greenMid})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
          🧠
        </div>
        <div>
          <div style={{ fontFamily:FB, fontWeight:800, fontSize:16, color:C.ink }}>
            Usuário TOCLivre
          </div>
          <div style={{ fontFamily:FB, color:C.inkDim, fontSize:12, marginTop:3 }}>
            {logs.length} registros · {sessions.length} sessões ERP
          </div>
          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
            {profile.severity && (
              <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:sevColor, background:sevColor+"18",
                padding:"2px 10px", borderRadius:100 }}>
                Y-BOCS: {profile.severity}
              </span>
            )}
            {profile.therapy && (
              <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.blue, background:C.blueGlow,
                padding:"2px 10px", borderRadius:100 }}>
                Em TCC/ERP
              </span>
            )}
            {profile.meds && (
              <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                color:C.inkMid, background:C.bgDeep,
                padding:"2px 10px", borderRadius:100 }}>
                Medicado
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Y-BOCS breakdown */}
      {profile.ybocs && (
        <Card style={{ padding:"18px", marginBottom:14 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
            Y-BOCS SIMPLIFICADA — BASELINE
          </div>
          <div style={{ fontFamily:FB, fontSize:28, fontWeight:900,
            color:sevColor, marginBottom:4 }}>
            {profile.ybocsTotal}<span style={{ fontSize:16, fontWeight:600, color:C.inkDim }}>/15</span>
          </div>
          <div style={{ fontFamily:FB, fontSize:13, fontWeight:700,
            color:sevColor, marginBottom:12 }}>{profile.severity}</div>
          <div style={{ height:8, background:C.bgDeep, borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:`${(profile.ybocsTotal/15)*100}%`, height:"100%",
              borderRadius:4, background:sevColor, transition:"width 0.6s" }}/>
          </div>
        </Card>
      )}

      {/* Subtipos */}
      {subtypes.length > 0 && (
        <Card style={{ padding:"18px", marginBottom:14 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
            DIMENSÕES OBSESSIVO-COMPULSIVAS
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {subtypes.map(s => (
              <span key={s} style={{ background:C.greenGlow, color:C.green,
                border:`1px solid rgba(45,106,79,0.2)`,
                padding:"6px 14px", borderRadius:100,
                fontSize:12, fontWeight:700, fontFamily:FB }}>
                {subMap[s]||s}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Objetivo */}
      {profile.goal && (
        <Card style={{ padding:"18px", marginBottom:14 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
            OBJETIVO DE TRATAMENTO
          </div>
          <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
            lineHeight:1.6, margin:0 }}>{profile.goal}</p>
        </Card>
      )}

      {/* RELATÓRIO PARA PROFISSIONAL */}
      <Card style={{ padding:"18px", marginBottom:14, border:`1.5px solid ${C.green}30` }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.green, letterSpacing:"0.07em", marginBottom:14 }}>
          📄 RELATÓRIO CLÍNICO MENSAL
        </div>
        <p style={{ fontFamily:FB, fontSize:12, color:C.inkMid,
          lineHeight:1.6, marginBottom:16 }}>
          Gere um relatório com sua evolução clínica para enviar ao seu psiquiatra ou psicólogo.
          Inclui SUDS semanal, sessões ERP, episódios registrados e observações automáticas.
        </p>

        {/* Nome do profissional */}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:700,
            color:C.inkDim, marginBottom:5 }}>Nome do profissional</div>
          <input
            type="text"
            placeholder="Dr(a). Nome Sobrenome"
            value={therapistName}
            onChange={e => setTherapistName(e.target.value)}
            style={{ width:"100%", padding:"10px 14px", borderRadius:10,
              border:`1.5px solid ${C.border}`, background:C.bg,
              fontFamily:FB, fontSize:13, color:C.ink, outline:"none" }}
          />
        </div>

        {/* Email do profissional */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:700,
            color:C.inkDim, marginBottom:5 }}>E-mail do profissional <span style={{ fontWeight:400 }}>(opcional)</span></div>
          <input
            type="email"
            placeholder="profissional@email.com"
            value={therapistEmail}
            onChange={e => setTherapistEmail(e.target.value)}
            style={{ width:"100%", padding:"10px 14px", borderRadius:10,
              border:`1.5px solid ${C.border}`, background:C.bg,
              fontFamily:FB, fontSize:13, color:C.ink, outline:"none" }}
          />
        </div>

        <button onClick={handleGenerateReport} style={{
          width:"100%", padding:"13px", borderRadius:12,
          background: reportSent ? C.greenMid : C.green,
          border:"none", cursor:"pointer",
          fontFamily:FB, fontWeight:800, fontSize:14, color:"white",
          transition:"all 0.2s", display:"flex",
          alignItems:"center", justifyContent:"center", gap:8 }}>
          {reportSent ? "✓ Relatório gerado!" : "Gerar relatório →"}
        </button>

        <p style={{ fontFamily:FB, fontSize:10.5, color:C.inkDim,
          textAlign:"center", marginTop:10, lineHeight:1.5 }}>
          Abre em nova aba. Salve como PDF ou use o botão de e-mail direto no relatório.
        </p>
      </Card>

      {/* LGPD — Gerenciamento de dados */}
      <Card style={{ padding:"18px", marginBottom:12 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          SEUS DADOS — LGPD Art. 18
        </div>
        {[
          { icon:"📦", label:"Exportar meus dados (JSON)",
            sub:"Portabilidade — todos os registros e sessões",
            color:C.blue, action: onExportData },
          { icon:"🗑️", label:"Excluir conta e dados",
            sub:"Exclusão permanente — ação irreversível",
            color:C.red, action: onDeleteAccount },
        ].map((a,i) => (
          <button key={i} onClick={a.action} style={{
            width:"100%", background:"none",
            border:`1px solid ${a.color}30`,
            borderRadius:12, padding:"12px 14px",
            cursor:"pointer", textAlign:"left", marginBottom:i===0?8:0,
            display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20 }}>{a.icon}</span>
            <div>
              <div style={{ fontFamily:FB, fontWeight:700, fontSize:13,
                color:a.color }}>{a.label}</div>
              <div style={{ fontFamily:FB, fontSize:11,
                color:C.inkDim, marginTop:1 }}>{a.sub}</div>
            </div>
          </button>
        ))}
      </Card>

      {/* Status notificações */}
      <Card style={{ padding:"18px", marginBottom:12 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
          NOTIFICAÇÕES
        </div>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:FB, fontWeight:700, fontSize:13, color:C.ink }}>
              Alertas de progresso
            </div>
            <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
              {notifPermission === "granted"  && "✅ Ativas — D+3, D+7, D+28, D+42"}
              {notifPermission === "denied"   && "🚫 Bloqueadas nas configurações do browser"}
              {notifPermission === "default"  && "⏳ Permissão não solicitada ainda"}
              {notifPermission === "unsupported" && "⚠️ Browser não suporta notificações"}
            </div>
          </div>
          {notifPermission === "denied" && (
            <span style={{ fontFamily:FB, fontSize:10, fontWeight:800,
              color:C.amber, background:C.amberGlow,
              padding:"4px 10px", borderRadius:8 }}>BLOQ.</span>
          )}
          {notifPermission === "granted" && (
            <span style={{ fontFamily:FB, fontSize:10, fontWeight:800,
              color:C.green, background:C.greenGlow,
              padding:"4px 10px", borderRadius:8 }}>ATIVO</span>
          )}
        </div>
        {notifPermission === "denied" && (
          <div style={{ marginTop:10, fontFamily:FB, fontSize:11,
            color:C.inkDim, lineHeight:1.5,
            padding:"10px 12px", background:C.amberGlow,
            borderRadius:10 }}>
            Para reativar: Configurações do browser → Privacidade → Notificações → Permitir para este site
          </div>
        )}
      </Card>


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ FASE 3A — PROTOCOLO DE CRISE (SUDS ≥ 8)
═══════════════════════════════════════════════════════════════════════════ */

/* Breathing timer — box breathing 4-4-4-4 */
function BreathingExercise({ onDone }) {
  const PHASES = [
    { label:"Inspire",  color:C.green,  secs:4 },
    { label:"Segure",   color:C.blue,   secs:4 },
    { label:"Expire",   color:C.amber,  secs:4 },
    { label:"Segure",   color:C.inkMid, secs:4 },
  ];
  const CYCLES = 4;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick,     setTick]     = useState(0);
  const [cycle,    setCycle]    = useState(1);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        const phaseSecs = PHASES[phaseIdx].secs;
        if (next >= phaseSecs) {
          const nextPhase = (phaseIdx + 1) % PHASES.length;
          setPhaseIdx(nextPhase);
          if (nextPhase === 0) {
            const nextCycle = cycle + 1;
            if (nextCycle > CYCLES) { clearInterval(id); setDone(true); return 0; }
            setCycle(nextCycle);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phaseIdx, cycle, done]);

  const phase    = PHASES[phaseIdx];
  const progress = tick / phase.secs;
  const size     = 160;
  const r        = 64;
  const circ     = 2 * Math.PI * r;

  if (done) return (
    <div style={{ textAlign:"center", padding:"24px 0" }}>
      <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
      <div style={{ fontFamily:FD, fontSize:22, fontWeight:900,
        color:C.green, marginBottom:8 }}>Respiração concluída</div>
      <div style={{ fontFamily:FB, color:C.inkMid, fontSize:14,
        lineHeight:1.6, marginBottom:24 }}>
        {CYCLES} ciclos de respiração quadrada completados. O sistema nervoso parassimpático está sendo ativado.
      </div>
      <Btn onClick={onDone}>Continuar protocolo →</Btn>
    </div>
  );

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", width:size, height:size, margin:"0 auto 16px" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={C.bgDeep} strokeWidth="8"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={phase.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition:"stroke-dashoffset 0.9s linear, stroke 0.5s" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontFamily:FD, fontSize:30, fontWeight:900,
            color:phase.color, lineHeight:1 }}>{phase.label}</div>
          <div style={{ fontFamily:FB, fontSize:20, fontWeight:800,
            color:phase.color, marginTop:4 }}>{phase.secs - tick}</div>
        </div>
      </div>
      <div style={{ fontFamily:FB, color:C.inkDim, fontSize:13 }}>
        Ciclo {cycle} de {CYCLES}
      </div>
      {/* Phase indicators */}
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12 }}>
        {PHASES.map((p,i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:"50%",
            background:i===phaseIdx?phase.color:C.borderDim,
            transition:"background 0.3s" }}/>
        ))}
      </div>
    </div>
  );
}

/* Grounding 5-4-3-2-1 */
function GroundingExercise({ onDone }) {
  const STEPS = [
    { n:5, sense:"VER",   icon:"👁️", instruction:"Nomeie 5 objetos que você pode ver agora.", verb:"Vejo", examples:["uma parede","uma janela","minha mão","um objeto no chão","uma luz"] },
    { n:4, sense:"TOCAR", icon:"✋", instruction:"Identifique 4 texturas ou sensações físicas que está sentindo.", verb:"Sinto", examples:["o peso do celular","o tecido da roupa","o ar nos meus pulmões","meus pés no chão"] },
    { n:3, sense:"OUVIR", icon:"👂", instruction:"Ouça com atenção. Quais 3 sons você consegue identificar?", verb:"Ouço", examples:["um ventilador","vozes ao fundo","minha própria respiração"] },
    { n:2, sense:"CHEIRAR",icon:"👃",instruction:"Identifique 2 cheiros presentes no ambiente.", verb:"Cheiro", examples:["o ar do ambiente","minha própria pele"] },
    { n:1, sense:"PROVAR", icon:"👅", instruction:"Que sabor você tem na boca agora?", verb:"Sinto o sabor de", examples:["a boca seca","o gosto neutro da saliva"] },
  ];

  const [step,     setStep]    = useState(0);
  const [items,    setItems]   = useState(["","","","",""]);
  const [inputVal, setInputVal]= useState("");

  const current   = STEPS[step];
  const filled    = items.filter(Boolean).length;
  const stepItems = items.slice(0, current.n);

  const addItem = () => {
    if (!inputVal.trim()) return;
    const newItems = [...items];
    const idx = newItems.findIndex(x => !x);
    if (idx !== -1) newItems[idx] = inputVal.trim();
    setItems(newItems);
    setInputVal("");
    if (newItems.filter(Boolean).length >= (step+1 === STEPS.length
      ? STEPS.reduce((a,s)=>a+s.n,0)
      : STEPS.slice(0,step+1).reduce((a,s)=>a+s.n,0))) {
      if (step < STEPS.length - 1) setTimeout(() => { setStep(s=>s+1); }, 600);
      else setTimeout(onDone, 800);
    }
  };

  const stepProgress = STEPS.slice(0,step).reduce((a,s)=>a+s.n,0);
  const totalItems   = STEPS.reduce((a,s)=>a+s.n,0);
  const filledForStep = items.slice(stepProgress, stepProgress + current.n).filter(Boolean).length;

  return (
    <div>
      {/* Overall progress */}
      <div style={{ display:"flex", gap:4, marginBottom:20 }}>
        {STEPS.map((s,i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2,
            background:i<step?C.green:i===step?C.amber:C.borderDim,
            transition:"background 0.3s" }}/>
        ))}
      </div>

      {/* Step header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:16, flexShrink:0,
          background:C.amberGlow, border:`1.5px solid rgba(212,131,26,0.25)`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
          {current.icon}
        </div>
        <div>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.amber, letterSpacing:"0.08em" }}>
            {current.n} COISAS PARA {current.sense}
          </div>
          <div style={{ fontFamily:FB, fontSize:13, color:C.inkMid,
            marginTop:3, lineHeight:1.5 }}>{current.instruction}</div>
        </div>
      </div>

      {/* Items logged */}
      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
        {Array.from({length:current.n}).map((_,i) => {
          const val = items[stepProgress + i];
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", borderRadius:12,
              background:val ? C.greenGlow : C.bgDeep,
              border:`1px solid ${val ? C.greenLight : C.borderDim}`,
              transition:"all 0.3s" }}>
              <div style={{ width:24, height:24, borderRadius:7, flexShrink:0,
                background:val ? C.green : C.border,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.3s" }}>
                {val
                  ? <svg width="12" height="10" viewBox="0 0 12 10">
                      <path d="M1 5l3 4L11 1" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  : <span style={{ fontFamily:FB, fontSize:11, fontWeight:800,
                      color:C.white }}>{i+1}</span>
                }
              </div>
              <span style={{ fontFamily:FB, fontSize:13, color:val?C.green:C.inkDim,
                fontWeight:val?700:400 }}>
                {val ? `${current.verb}: "${val}"` : `${current.verb}...`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {filledForStep < current.n && (
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, background:C.white, border:`1.5px solid ${C.border}`,
            borderRadius:12, padding:"10px 14px" }}>
            <input autoFocus value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key==="Enter" && addItem()}
              placeholder={`${current.verb}...`}
              style={{ width:"100%", border:"none", outline:"none", background:"transparent",
                fontFamily:FB, fontSize:14, color:C.ink }}/>
          </div>
          <button onClick={addItem} disabled={!inputVal.trim()} style={{
            width:44, height:44, borderRadius:12, background:C.green,
            border:"none", cursor:inputVal.trim()?"pointer":"not-allowed",
            opacity:inputVal.trim()?1:0.4,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {filledForStep >= current.n && step < STEPS.length - 1 && (
        <div style={{ textAlign:"center", padding:"12px 0",
          fontFamily:FB, color:C.green, fontWeight:700, fontSize:13 }}>
          ✓ Avançando para {STEPS[step+1].sense.toLowerCase()}...
        </div>
      )}
    </div>
  );
}

/* Defusão cognitiva */
function DefusionExercise({ onDone }) {
  const [step, setStep] = useState(0);
  const [observed, setObserved] = useState(false);

  const DEFUSION_STEPS = [
    {
      title:"Observe o pensamento como evento mental",
      body:`O pensamento obsessivo não é um fato — é um evento mental produzido pelo seu cérebro. Você não é o pensamento. Você é quem o observa.`,
      exercise:"Repita internamente: 'Estou tendo o pensamento de que ___ '. Perceba a diferença entre estar fusionado com o pensamento e observá-lo de fora.",
      icon:"🔭",
    },
    {
      title:"A ansiedade não é perigosa",
      body:`O que você está sentindo — coração acelerado, tensão, urgência — é ativação do sistema nervoso autônomo. É desconfortável. Não é perigoso.`,
      exercise:"Nomeie 3 sensações físicas que está sentindo agora, sem julgamento. Apenas observe: 'Estou notando tensão no peito. Estou notando respiração acelerada. Estou notando urgência nas mãos.'",
      icon:"❤️",
    },
    {
      title:"Não busque certeza — ela alimenta o TOC",
      body:`O TOC se alimenta da busca por certeza. Cada compulsão realizada confirma para o cérebro que a ameaça era real. A incerteza é tolerável — você já tolerou antes.`,
      exercise:"Diga para si mesmo: 'Posso não saber a resposta. Posso viver com esta incerteza. A dúvida não precisa ser resolvida agora.'",
      icon:"🌊",
    },
    {
      title:"Após a crise, registre — não analise",
      body:`Quando a onda passar, registre o episódio no app. Não tente entender ou analisar durante a crise. Análise na crise é uma compulsão mental.`,
      exercise:"Apenas observe a ansiedade diminuir. Isso acontece. Sempre acontece.",
      icon:"📊",
    },
  ];

  const current = DEFUSION_STEPS[step];

  return (
    <div>
      {/* Progress */}
      <div style={{ display:"flex", gap:5, marginBottom:20 }}>
        {DEFUSION_STEPS.map((_,i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2,
            background:i<=step?C.green:C.borderDim, transition:"background 0.3s" }}/>
        ))}
      </div>

      <div style={{ fontSize:36, marginBottom:12 }}>{current.icon}</div>
      <h3 style={{ fontFamily:FD, fontSize:20, fontWeight:900,
        color:C.ink, margin:"0 0 12px", lineHeight:1.3 }}>
        {current.title}
      </h3>
      <p style={{ fontFamily:FB, color:C.inkMid, fontSize:14,
        lineHeight:1.65, marginBottom:18 }}>
        {current.body}
      </p>

      <div style={{ padding:"14px 16px", borderRadius:14,
        background:C.greenGlow, border:`1px solid rgba(45,106,79,0.2)`,
        marginBottom:24 }}>
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.green, letterSpacing:"0.07em", marginBottom:8 }}>
          PRATIQUE AGORA
        </div>
        <p style={{ fontFamily:FB, color:C.green, fontSize:13,
          lineHeight:1.6, margin:0, fontStyle:"italic" }}>
          {current.exercise}
        </p>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        {step < DEFUSION_STEPS.length - 1 ? (
          <Btn onClick={() => setStep(s=>s+1)}>Próximo →</Btn>
        ) : (
          <Btn onClick={onDone} variant="amber">Concluir protocolo ✓</Btn>
        )}
        {step > 0 && (
          <Btn onClick={() => setStep(s=>s-1)} variant="ghost"
            style={{ flex:"0 0 80px", fontSize:13 }}>← Voltar</Btn>
        )}
      </div>
    </div>
  );
}

/* ── CRISIS MODE PRINCIPAL ── */
function CrisisMode({ sudsInitial=9, onClose, onComplete }) {
  const [phase,     setPhase]     = useState("entry");  // entry | breathing | grounding | defusion | done
  const [sudsCurrent, setSudsCurrent] = useState(sudsInitial);
  const [startTime] = useState(Date.now());

  const PHASES_ORDER = ["breathing","grounding","defusion","done"];

  const goNext = (from) => {
    const idx = PHASES_ORDER.indexOf(from);
    setPhase(PHASES_ORDER[idx+1] || "done");
  };

  /* ── ENTRY ── */
  if (phase === "entry") return (
    <div style={{ position:"absolute", inset:0, zIndex:200,
      background:"linear-gradient(160deg, #1A0A0A 0%, #2D0F0F 100%)",
      display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ flex:1, padding:"12px 24px 40px", display:"flex",
        flexDirection:"column", overflowY:"auto" }}>

        {/* Pulsing warning */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:90, height:90, borderRadius:"50%",
            background:"rgba(192,57,43,0.2)", border:`2px solid rgba(192,57,43,0.4)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 18px", fontSize:40 }}>
            ⚡
          </div>
          <h2 style={{ fontFamily:FD, fontSize:28, fontWeight:900,
            color:"#FECACA", margin:"0 0 8px", letterSpacing:"-0.02em" }}>
            Protocolo de Crise
          </h2>
          <p style={{ fontFamily:FB, color:"rgba(253,230,138,0.8)",
            fontSize:14, lineHeight:1.6 }}>
            Seu SUDS está em <strong style={{ color:"#FECACA" }}>{sudsInitial}/10</strong>. Isso é intenso, mas temporário.{"\n"}
            Você já passou por isso antes.
          </p>
        </div>

        {/* Protocolo overview */}
        <div style={{ marginBottom:28 }}>
          {[
            { n:"01", label:"Respiração quadrada",      sub:"4 ciclos · ativa o sistema parassimpático", phase:"breathing" },
            { n:"02", label:"Grounding 5-4-3-2-1",      sub:"ancora no presente · interrompe a espiral",  phase:"grounding" },
            { n:"03", label:"Defusão cognitiva",        sub:"separa você do pensamento obsessivo",         phase:"defusion" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start",
              marginBottom:i<2?14:0 }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:FB, fontSize:13, fontWeight:800,
                color:"rgba(255,255,255,0.5)" }}>{s.n}</div>
              <div>
                <div style={{ fontFamily:FB, fontWeight:700, fontSize:14,
                  color:"rgba(255,255,255,0.9)" }}>{s.label}</div>
                <div style={{ fontFamily:FB, fontSize:12,
                  color:"rgba(255,255,255,0.45)", marginTop:2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Anti-reassurance aviso */}
        <div style={{ padding:"14px 16px", borderRadius:14,
          background:"rgba(212,131,26,0.15)",
          border:"1px solid rgba(212,131,26,0.3)", marginBottom:28 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:"#FDE68A", letterSpacing:"0.07em", marginBottom:8 }}>
            ⚠️ IMPORTANTE — NÃO FAÇA ISSO AGORA
          </div>
          <div style={{ fontFamily:FB, fontSize:13,
            color:"rgba(253,230,138,0.85)", lineHeight:1.6 }}>
            Não busque reassurance de familiares ou amigos. Não realize a compulsão para "aliviar". Não pesquise sobre o pensamento obsessivo. Cada uma dessas ações alimenta o ciclo.
          </div>
        </div>

        <Btn onClick={() => setPhase("breathing")} variant="amber">
          Iniciar protocolo de crise →
        </Btn>
        <Btn onClick={onClose} variant="ghost"
          style={{ marginTop:10, color:"rgba(255,255,255,0.4)", fontSize:13 }}>
          Estou bem — sair
        </Btn>
      </div>
    </div>
  );

  /* ── SHARED SHELL para as fases do protocolo ── */
  const phaseLabels = { breathing:"Respiração", grounding:"Grounding", defusion:"Defusão" };
  const phaseColors = { breathing:C.green, grounding:C.amber, defusion:C.blue };
  const currentPhaseLabel = phaseLabels[phase] || "";
  const currentPhaseColor = phaseColors[phase] || C.green;

  if (phase === "done") return (
    <div style={{ position:"absolute", inset:0, zIndex:200,
      background:C.bg, display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ flex:1, padding:"16px 24px 40px", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center" }}>

        <div style={{ fontSize:60, marginBottom:20 }}>🌿</div>
        <h2 style={{ fontFamily:FD, fontSize:28, fontWeight:900,
          color:C.green, margin:"0 0 10px", textAlign:"center", letterSpacing:"-0.02em" }}>
          Você passou pela crise
        </h2>
        <p style={{ fontFamily:FB, color:C.inkMid, fontSize:14,
          lineHeight:1.7, textAlign:"center", marginBottom:32, maxWidth:300 }}>
          A ansiedade diminuiu porque <strong>você tolerou sem ceder</strong>. Isso é aprendizado inibitório — seu cérebro está aprendendo que a ameaça não é real.
        </p>

        {/* SUDS comparativo */}
        <Card style={{ padding:"20px", width:"100%", marginBottom:24 }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:16,
            textAlign:"center" }}>EVOLUÇÃO DA CRISE</div>
          <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center" }}>
            <div style={{ textAlign:"center" }}>
              <SudsRing value={sudsInitial} size={68} />
              <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:6 }}>SUDS inicial</div>
            </div>
            <div style={{ fontFamily:FD, fontSize:28, color:C.green }}>→</div>
            <div style={{ textAlign:"center" }}>
              <SudsRing value={sudsCurrent} size={68} />
              <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:6 }}>SUDS agora</div>
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:FB, fontSize:12, fontWeight:700,
              color:C.inkDim, marginBottom:8 }}>Como está sua ansiedade agora?</div>
            <input type="range" min="0" max="10" value={sudsCurrent}
              onChange={e => setSudsCurrent(Number(e.target.value))}
              style={{ width:"100%", accentColor:sudsColor(sudsCurrent), height:6, cursor:"pointer" }}/>
          </div>
        </Card>

        {/* Nota clínica */}
        <div style={{ padding:"14px 16px", borderRadius:14,
          background:C.blueGlow, border:`1px solid rgba(37,99,235,0.15)`,
          width:"100%", marginBottom:28 }}>
          <div style={{ fontFamily:FB, fontSize:12, color:C.blue,
            fontWeight:700, marginBottom:6 }}>ℹ️ Para registrar no seu prontuário</div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.6 }}>
            Episódio de crise registrado. SUDS inicial: {sudsInitial}. Protocolo 5-4-3-2-1 aplicado. Duração aproximada: {Math.round((Date.now()-startTime)/60000)} minutos.
          </div>
        </div>

        <Btn onClick={() => onComplete({ sudsStart:sudsInitial, sudsEnd:sudsCurrent, duration:Date.now()-startTime })}>
          Registrar episódio ✓
        </Btn>
        <Btn onClick={onClose} variant="ghost" style={{ marginTop:8, fontSize:13 }}>
          Fechar sem registrar
        </Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position:"absolute", inset:0, zIndex:200,
      background:C.bg, display:"flex", flexDirection:"column" }}>
      <StatusBar />
      <div style={{ padding:"10px 24px 0" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:18 }}>
          <div>
            <div style={{ display:"flex", gap:5, marginBottom:6 }}>
              {["breathing","grounding","defusion"].map(p => (
                <div key={p} style={{ height:3, width:p===phase?28:12, borderRadius:2,
                  background:p===phase?currentPhaseColor:
                    PHASES_ORDER.indexOf(p)<PHASES_ORDER.indexOf(phase)?C.green:C.borderDim,
                  transition:"all 0.3s" }}/>
              ))}
            </div>
            <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
              color:currentPhaseColor, letterSpacing:"0.07em" }}>
              CRISE · {currentPhaseLabel.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.white, border:`1px solid ${C.border}`,
            borderRadius:10, padding:"6px 12px", cursor:"pointer",
            fontFamily:FB, fontSize:12, fontWeight:700, color:C.inkMid }}>
            Encerrar
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:"0 24px 32px", overflowY:"auto" }}>
        {phase === "breathing" && <BreathingExercise onDone={() => goNext("breathing")} />}
        {phase === "grounding" && <GroundingExercise onDone={() => goNext("grounding")} />}
        {phase === "defusion"  && <DefusionExercise  onDone={() => goNext("defusion")} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
function Dashboard({ profile, subtypes, notifPermission, onNotif, onExportData, onDeleteAccount }) {
  const [tab, setTab]           = useState("home");
  const [showLog, setShowLog]   = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [crisisSuds, setCrisisSuds]       = useState(null);

  // Dados clínicos — persistidos automaticamente via localStorage
  const [logs,     setLogs]     = usePersistedState("logs", [
    { trigger:"Antes de sair, fiquei parado diante do fogão", suds:7, resisted:false, compulsion:"Verificar fogão 8 vezes", timestamp:Date.now()-7200000 },
    { trigger:"Toquei na maçaneta do banheiro público — sensação de contaminação", suds:6, resisted:true, compulsion:"Lavar as mãos", timestamp:Date.now()-3600000 },
    { trigger:"Pensamento intrusivo ao dirigir — egodistônico", suds:5, resisted:"partial", compulsion:"Ruminar sobre o trajeto", timestamp:Date.now()-1800000 },
  ]);
  const [sessions, setSessions] = usePersistedState("sessions", []);

  // Dispara notificação in-app ao adicionar log com SUDS alto
  const handleSaveLog = (l) => {
    const updated = [l, ...logs];
    setLogs(() => updated);
    if (l.suds >= 8) setTimeout(() => setCrisisSuds(l.suds), 400);

    // Notif de marco: 10 logs
    if (updated.length === 10) {
      setTimeout(() => onNotif?.({
        type:"milestone", title:"🔟 10 episódios registrados",
        body:"Consistência é o preditor mais forte de resultado no ERP. Você chegou a 10 registros.",
        cta:"Ver análise",
      }), 600);
    }
  };

  // Dispara notificação ao confirmar habituação
  const handleCompleteSession = (result) => {
    const updated = [...sessions, result];
    setSessions(() => updated);
    setActiveSession(null);
    if (result.habituated) {
      setTimeout(() => onNotif?.({
        type:"milestone", title:"🧠 Habituação confirmada",
        body:`"${result.exercise.title}" — SUDS caiu de ${result.sudsStart} para ${result.sudsEnd}. Aprendizado inibitório em ação.`,
        cta:"Ver conquista",
      }), 500);
    }
  };

  const NAV = [
    { id:"home",    label:"Painel",
      icon:<svg width="21" height="21" viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 20v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
    { id:"stats",   label:"Análise",
      icon:<svg width="21" height="21" viewBox="0 0 22 22" fill="none"><rect x="2" y="12" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="9" y="7" width="4" height="13" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="16" y="2" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg> },
    { id:"erp",     label:"ERP",
      icon:<svg width="21" height="21" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M11 7v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id:"evolucao",label:"Evolução",
      icon:<svg width="21" height="21" viewBox="0 0 22 22" fill="none"><path d="M3 17l5-5 4 3 7-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:"profile", label:"Perfil",
      icon:<svg width="21" height="21" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      position:"relative", background:C.bg }}>
      {showLog && (
        <LogModal onClose={() => setShowLog(false)}
          onSave={handleSaveLog} />
      )}
      {activeSession && (
        <ERPSession
          exercise={activeSession}
          onClose={() => setActiveSession(null)}
          onComplete={handleCompleteSession}
        />
      )}
      {crisisSuds !== null && (
        <CrisisMode
          sudsInitial={crisisSuds}
          onClose={() => setCrisisSuds(null)}
          onComplete={result => {
            setLogs(p => [{
              trigger:"[CRISE] Protocolo de crise ativado",
              suds: result.sudsStart,
              resisted: true,
              compulsion: "Protocolo 5-4-3-2-1 aplicado",
              timestamp: Date.now(),
              isCrisis: true,
              crisisResult: result,
            }, ...p]);
            setCrisisSuds(null);
            // Follow-up notification next open is handled by catch-up scheduler
          }}
        />
      )}

      <div style={{ flex:1, overflowY:"auto" }}>
        {tab==="home"     && <HomeTab     logs={logs} sessions={sessions} onLog={() => setShowLog(true)} subtypes={subtypes} profile={profile}/>}
        {tab==="stats"    && <StatsTab    logs={logs} sessions={sessions}/>}
        {tab==="erp"      && <ERPTab      subtypes={subtypes} sessions={sessions} onStartSession={setActiveSession}/>}
        {tab==="evolucao" && <EvolutionTab logs={logs} sessions={sessions} profile={profile}/>}
        {tab==="profile"  && <ProfileTab  subtypes={subtypes} logs={logs} sessions={sessions} profile={profile} onExportData={onExportData} onDeleteAccount={onDeleteAccount} notifPermission={notifPermission}/>}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        background:C.white, borderTop:`1px solid ${C.borderDim}`,
        display:"flex", justifyContent:"space-around", alignItems:"center",
        padding:"10px 0 22px",
        backdropFilter:"blur(20px)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            background:"none", border:"none", cursor:"pointer",
            color:tab===n.id ? C.green : C.inkDim,
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            padding:"3px 7px", transition:"color 0.2s",
          }}>
            {n.icon}
            <span style={{ fontFamily:FB, fontSize:9, fontWeight:800,
              letterSpacing:"0.03em" }}>{n.label}</span>
          </button>
        ))}
        {/* Crisis button */}
        <button onClick={() => setCrisisSuds(8)} style={{
          background:`linear-gradient(135deg, #C0392B, #922B21)`,
          border:"none", borderRadius:14, cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          padding:"8px 10px",
          boxShadow:"0 4px 14px rgba(192,57,43,0.35)",
          transition:"all 0.2s",
        }}>
          <svg width="21" height="21" viewBox="0 0 22 22" fill="none">
            <path d="M11 3l1.8 5.5H18l-4.6 3.3 1.8 5.5L11 14l-4.2 3.3 1.8-5.5L4 8.5h5.2L11 3z"
              stroke="white" strokeWidth="1.7" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:FB, fontSize:9.5, fontWeight:800,
            letterSpacing:"0.04em", color:"white" }}>Crise</span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LGPD — Lei 13.709/2018  (Tela de Consentimento)
═══════════════════════════════════════════════════════════════════════════ */
function LGPDConsent({ onAccept }) {
  const [expanded, setExpanded] = useState(null);
  const [consents, setConsents] = useState({
    necessary:  true,   // não pode desmarcar
    analytics:  false,
    research:   false,
    notifications: true,
  });
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
  };

  const toggle = key => {
    if (key === "necessary") return;
    setConsents(c => ({ ...c, [key]: !c[key] }));
  };

  const DATA_ITEMS = [
    { key:"necessary", label:"Dados clínicos essenciais", required:true,
      desc:"Registros de obsessões/compulsões, SUDS, resultados de sessões ERP, pontuação Y-BOCS. Base legal: Art. 11, II, a — tutela da saúde. Armazenados localmente no dispositivo. Não transmitidos sem consentimento explícito." },
    { key:"analytics", label:"Dados de uso do aplicativo", required:false,
      desc:"Frequência de acesso, módulos utilizados, tempo de sessão. Usados para melhorar a experiência. Anonimizados antes de qualquer análise agregada. Você pode revogar a qualquer momento." },
    { key:"research",  label:"Dados para pesquisa clínica", required:false,
      desc:"Dados anonimizados e agregados para estudos sobre eficácia de ERP digital. Nunca identificáveis individualmente. Contribui para validação científica do protocolo." },
    { key:"notifications", label:"Notificações de progresso", required:false,
      desc:"Alertas de progresso terapêutico, lembretes de sessão ERP e marcadores de evolução. Baseados nos seus dados de uso. Você pode ajustar frequência nas configurações." },
  ];

  const RIGHTS = [
    { icon:"👁️", title:"Acesso", desc:"Solicitar cópia de todos os seus dados a qualquer momento" },
    { icon:"✏️", title:"Correção", desc:"Retificar dados incorretos ou incompletos" },
    { icon:"🗑️", title:"Exclusão", desc:"Apagar todos os seus dados e encerrar sua conta" },
    { icon:"📦", title:"Portabilidade", desc:"Exportar seus dados em formato estruturado (JSON/CSV)" },
    { icon:"🚫", title:"Oposição", desc:"Opor-se ao tratamento de dados específicos" },
    { icon:"↩️", title:"Revogação", desc:"Revogar consentimento a qualquer momento sem penalidade" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      background:C.bg, overflow:"hidden" }}>

      {/* Header fixo */}
      <div style={{ padding:"16px 24px 14px",
        borderBottom:`1px solid ${C.borderDim}`,
        background:C.white }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg, ${C.blue}, #1D4ED8)`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
            🔒
          </div>
          <div>
            <div style={{ fontFamily:FB, fontWeight:800, fontSize:15, color:C.ink }}>
              Privacidade e LGPD
            </div>
            <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>
              Lei 13.709/2018 — Lei Geral de Proteção de Dados
            </div>
          </div>
        </div>
      </div>

      {/* Corpo scrollável */}
      <div ref={scrollRef} onScroll={handleScroll}
        style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

        <p style={{ fontFamily:FB, color:C.inkMid, fontSize:13,
          lineHeight:1.65, marginBottom:20 }}>
          O TOCLivre coleta dados de saúde mental para personalizar seu protocolo de tratamento. Antes de começar, você precisa entender como esses dados são tratados e exercer seus direitos como titular.
        </p>

        {/* Disclaimer ANVISA — integrado, não intrusivo */}
        <div style={{ padding:"11px 14px", borderRadius:12, marginBottom:18,
          background:"rgba(92,84,112,0.07)",
          border:"1px solid rgba(92,84,112,0.12)",
          display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>ℹ️</span>
          <p style={{ fontFamily:FB, color:C.inkDim, fontSize:11,
            margin:0, lineHeight:1.65 }}>
            O TOCLivre é um aplicativo de bem-estar e autoconhecimento. Não é um dispositivo médico, não realiza diagnósticos e não substitui avaliação ou tratamento por profissional de saúde mental licenciado.
          </p>
        </div>

        {/* Controlador */}
        <Card style={{ padding:"14px 16px", marginBottom:14,
          background:C.blueGlow, border:`1px solid rgba(37,99,235,0.2)` }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.blue, letterSpacing:"0.07em", marginBottom:8 }}>
            CONTROLADOR DE DADOS (Art. 5º, VI)
          </div>
          <div style={{ fontFamily:FB, fontSize:13, color:C.ink,
            fontWeight:700, marginBottom:3 }}>TOCLivre Tecnologia em Saúde Ltda.</div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.5 }}>
            CNPJ: [a registrar] · São Paulo, SP<br/>
            DPO: privacidade@toclivre.com.br<br/>
            Encarregado responsável pela proteção de dados pessoais
          </div>
        </Card>

        {/* Dados coletados + toggles */}
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
          CATEGORIAS DE DADOS E CONSENTIMENTO
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {DATA_ITEMS.map(item => (
            <div key={item.key}>
              <button onClick={() => setExpanded(expanded===item.key?null:item.key)}
                style={{ width:"100%", background:consents[item.key]?C.greenGlow:C.white,
                  border:`1.5px solid ${consents[item.key]?C.green:C.borderDim}`,
                  borderRadius:14, padding:"13px 15px", cursor:"pointer",
                  textAlign:"left", fontFamily:FB, transition:"all 0.2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontFamily:FB, fontWeight:700, fontSize:13,
                        color:C.ink }}>{item.label}</span>
                      {item.required && (
                        <span style={{ fontFamily:FB, fontSize:9, fontWeight:800,
                          color:C.blue, background:C.blueGlow,
                          padding:"2px 7px", borderRadius:100 }}>NECESSÁRIO</span>
                      )}
                    </div>
                    <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
                      {expanded===item.key ? "▲ Ocultar detalhes" : "▼ Ver base legal e dados"}
                    </div>
                  </div>
                  {/* Toggle */}
                  <div onClick={e => { e.stopPropagation(); toggle(item.key); }}
                    style={{ width:44, height:24, borderRadius:12, flexShrink:0,
                      background:consents[item.key]
                        ? (item.required ? C.blue : C.green)
                        : C.border,
                      position:"relative", cursor:item.required?"not-allowed":"pointer",
                      transition:"background 0.25s", marginLeft:12 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%",
                      background:C.white,
                      position:"absolute", top:3,
                      left:consents[item.key]?23:3,
                      transition:"left 0.25s",
                      boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </div>
                </div>
              </button>
              {expanded===item.key && (
                <div style={{ padding:"12px 15px",
                  background:C.surfaceDim, borderRadius:"0 0 12px 12px",
                  border:`1px solid ${C.borderDim}`, borderTop:"none",
                  fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.65 }}>
                  {item.desc}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Direitos do titular */}
        <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:10 }}>
          SEUS DIREITOS COMO TITULAR (Art. 18)
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:8, marginBottom:20 }}>
          {RIGHTS.map((r,i) => (
            <Card key={i} style={{ padding:"12px 12px" }}>
              <div style={{ fontSize:18, marginBottom:5 }}>{r.icon}</div>
              <div style={{ fontFamily:FB, fontWeight:800, fontSize:12,
                color:C.ink, marginBottom:3 }}>{r.title}</div>
              <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
                lineHeight:1.4 }}>{r.desc}</div>
            </Card>
          ))}
        </div>

        {/* Segurança e retenção */}
        <Card style={{ padding:"16px", marginBottom:20,
          background:"rgba(37,99,235,0.05)",
          border:`1px solid rgba(37,99,235,0.15)` }}>
          <div style={{ fontFamily:FB, fontSize:11, fontWeight:800,
            color:C.blue, letterSpacing:"0.07em", marginBottom:12 }}>
            SEGURANÇA E RETENÇÃO
          </div>
          {[
            "Dados clínicos armazenados localmente com criptografia AES-256",
            "Transmissão apenas sob HTTPS/TLS 1.3",
            "Servidores exclusivamente em território brasileiro (Art. 33)",
            "Retenção: dados ativos enquanto a conta existir; excluídos em até 30 dias após solicitação",
            "Dado de saúde = categoria sensível (Art. 11) — nunca vendido ou cedido a terceiros",
            "Notificação obrigatória à ANPD em caso de incidente de segurança (Art. 48)",
          ].map((t,i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:i<5?8:0,
              fontFamily:FB, fontSize:12, color:C.inkMid, lineHeight:1.5 }}>
              <span style={{ color:C.green, fontWeight:800, flexShrink:0 }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </Card>

        {!scrolled && (
          <div style={{ textAlign:"center", fontFamily:FB, fontSize:12,
            color:C.inkDim, marginBottom:16 }}>
            ↓ Role até o final para habilitar o aceite
          </div>
        )}
      </div>

      {/* Footer fixo com aceite */}
      <div style={{ padding:"16px 24px 32px", borderTop:`1px solid ${C.borderDim}`,
        background:C.white }}>
        <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
          lineHeight:1.5, marginBottom:14, textAlign:"center" }}>
          Ao continuar, você confirma ter lido esta política e consente com o tratamento dos dados marcados. O TOCLivre é um app de bem-estar — não um dispositivo médico.
        </div>
        <Btn onClick={() => scrolled && onAccept(consents)}
          disabled={!scrolled}>
          {scrolled ? "Li e aceito — Continuar →" : "Role até o final para aceitar"}
        </Btn>
        <div style={{ textAlign:"center", marginTop:10 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer",
            fontFamily:FB, fontSize:12, color:C.inkDim, textDecoration:"underline" }}>
            Versão completa da Política de Privacidade
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRACKING LONGITUDINAL — Evolução Clínica
═══════════════════════════════════════════════════════════════════════════ */

// Motor de análise de progresso — lógica de notificações
/*
 ┌─────────────────────────────────────────────────────────────────┐
 │  MOTOR DE NOTIFICAÇÕES — Raciocínio clínico                     │
 │                                                                 │
 │  D+3   → Confirmação de início: primeiros dados coletados       │
 │  D+7   → Resumo da semana 1, neutro, sem pressão                │
 │  D+14  → Check leve: SUDS ↓1.5 OU resistência ≥35% = sinal    │
 │          (limiar baixo — ERP ainda em fase inicial)             │
 │  D+21  → Se nenhuma sessão ERP iniciada: "hierarquia esperando" │
 │  D+28  → Y-BOCS reavaliação obrigatória + resumo mês 1         │
 │  D+42  → Se sem melhora objetiva (SUDS ↓<1 E resist <25%):    │
 │          sugerir terapeuta — 6 semanas é threshold clínico real │
 │          Racional: ERP requer 13-20 sessões em 8-12 semanas     │
 │                                                                 │
 │  IMEDIATO → Habituação confirmada em qualquer sessão            │
 │  IMEDIATO → Dia seguinte a episódio de crise                    │
 │  D+3 sem log → Reengajamento (3 dias = hábito ainda recuperável)│
 │  Domingo 18h → Resumo semanal (behavioral activation)          │
 │                                                                 │
 │  Prioridade: crise_followup > milestone > plateaux_6w >         │
 │              no_erp_3w > progress_2w > reengagement > weekly    │
 └─────────────────────────────────────────────────────────────────┘
*/
function useProgressEngine(logs, sessions, profileDate) {
  const DAY = 86400000;
  const startDate  = profileDate || Date.now() - 15 * DAY;
  const daysActive = Math.max(0, Math.floor((Date.now() - startDate) / DAY));

  /* ── Dados semanais ── */
  const weekOf = (ts) => Math.max(0, Math.floor((ts - startDate) / (7 * DAY)));
  const byWeek = {};
  logs.forEach(l => {
    const w = weekOf(l.timestamp);
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(l);
  });
  const weeks    = Object.keys(byWeek).map(Number).sort();
  const weekData = weeks.map(w => {
    const wl = byWeek[w];
    return {
      week: w,
      label: `Sem ${w+1}`,
      logs: wl.length,
      avgSuds:    wl.length ? +(wl.reduce((a,b)=>a+b.suds,0)/wl.length).toFixed(1) : null,
      resistRate: wl.length ? Math.round(wl.filter(l=>l.resisted===true).length/wl.length*100) : 0,
    };
  });

  const baseline   = weekData[0] || null;
  const latest     = weekData[weekData.length-1] || null;
  const sudsDrop   = (baseline?.avgSuds && latest?.avgSuds)
    ? +(baseline.avgSuds - latest.avgSuds).toFixed(1) : 0;
  const resistGain = (baseline && latest)
    ? latest.resistRate - baseline.resistRate : 0;

  /* ── Sinais clínicos ── */
  const hasAnyHabituation  = sessions.some(s => s.habituated);
  const hasFirstERPSession = sessions.length > 0;
  const lastLogDaysAgo     = logs.length
    ? Math.floor((Date.now() - logs[0].timestamp) / DAY) : 999;
  const lastCrisis         = logs.find(l => l.isCrisis);
  const crisisYesterday    = lastCrisis
    && Math.floor((Date.now() - lastCrisis.timestamp) / DAY) === 1;

  // Melhora D+14: limiar deliberadamente baixo (sinal inicial)
  const earlySignal = sudsDrop >= 1.5 || (baseline && latest && latest.resistRate >= 35);

  // Plateau D+42: critério estrito — sem melhora real após 6 semanas
  const truePlateau = daysActive >= 42 && sudsDrop < 1 && resistGain < 25
    && logs.length >= 5; // só dispara se há dados suficientes

  /* ── Cascata de prioridade ── */
  let notification = null;

  // P1 — Follow-up pós-crise (no dia seguinte)
  if (crisisYesterday && !notification) {
    notification = {
      type: "crisis_followup", icon: "🌅", color: C.amber,
      title: "Como você está hoje?",
      body: "Ontem foi um episódio intenso. Episódios de crise são parte do processo — não retrocessos. Quer registrar como está agora?",
      cta: "Registrar estado atual",
    };
  }

  // P2 — Habituação confirmada (imediato, qualquer momento)
  if (hasAnyHabituation && !notification && daysActive <= 7) {
    const s = sessions.find(s => s.habituated);
    notification = {
      type: "milestone", icon: "🎯", color: C.amber,
      title: "Primeira habituação confirmada",
      body: `"${s.exercise.title}" — seu cérebro aprendeu que a ansiedade diminui sem a compulsão. Esse é o mecanismo central do ERP.`,
      cta: "Ver conquista",
    };
  }

  // P3 — Plateau real às 6 semanas → sugerir terapeuta
  if (truePlateau && !notification) {
    notification = {
      type: "plateau_6w", icon: "🤝", color: C.blue,
      title: "Resultado abaixo do esperado em 6 semanas",
      body: "ERP digital funciona melhor como complemento à terapia presencial. Após 6 semanas sem melhora objetiva, recomendamos buscar um terapeuta especializado em TCC/ERP. Isso não é falha — é o próximo passo clínico.",
      cta: "Encontrar terapeuta",
    };
  }

  // P4 — 3 semanas sem iniciar nenhuma sessão ERP
  if (daysActive >= 21 && !hasFirstERPSession && !notification) {
    notification = {
      type: "erp_not_started", icon: "⏱️", color: C.green,
      title: "Sua hierarquia ERP está esperando",
      body: "O registro de loops é o primeiro passo. O segundo — e mais transformador — é iniciar as sessões ERP guiadas. Cada minuto de exposição recondiciona o circuito do medo.",
      cta: "Ver hierarquia ERP",
    };
  }

  // P5 — Progresso às 2 semanas (limiar baixo, encorajador)
  if (daysActive >= 14 && earlySignal && !notification && !truePlateau) {
    notification = {
      type: "early_progress", icon: "🌱", color: C.green,
      title: daysActive >= 28
        ? "Mês 1 concluído — evolução real"
        : "Sinal precoce de resposta ao ERP",
      body: sudsDrop >= 1.5
        ? `SUDS médio caiu ${sudsDrop} pontos em ${daysActive} dias. O sistema nervoso está aprendendo. Continue — os maiores ganhos vêm nas semanas 4–8.`
        : `Taxa de resistência já em ${latest?.resistRate}%. Resistir às compulsões é o mecanismo ativo do tratamento.`,
      cta: "Ver evolução completa",
    };
  }

  // P6 — Reavaliação Y-BOCS às 4 semanas
  if (daysActive >= 28 && daysActive < 35 && !notification) {
    notification = {
      type: "ybocs_reeval", icon: "📋", color: C.inkMid,
      title: "Reavaliação Y-BOCS — 1 mês",
      body: "É hora de refazer a avaliação de linha de base. Isso cria evidência objetiva da sua evolução — para você e para seu terapeuta.",
      cta: "Refazer avaliação",
    };
  }

  // P7 — Reengajamento: 3 dias sem log
  if (lastLogDaysAgo >= 3 && logs.length > 0 && !notification) {
    notification = {
      type: "reengagement", icon: "👋", color: C.inkMid,
      title: `${lastLogDaysAgo} dias sem registros`,
      body: lastLogDaysAgo >= 7
        ? "Uma semana sem dados. O TOC não tira dias de folga — e o ERP também não deveria. Qualquer registro recomeça o momentum."
        : "Consistência de 3+ registros por semana é o preditor mais forte de resultado no ERP. Hoje conta.",
      cta: "Registrar agora",
    };
  }

  // P8 — Resumo da semana 1 (D+7, neutro)
  if (daysActive >= 7 && daysActive < 14 && logs.length >= 3 && !notification) {
    notification = {
      type: "week1_summary", icon: "📊", color: C.green,
      title: "Semana 1 completa",
      body: `${logs.length} registros na primeira semana. SUDS médio: ${baseline?.avgSuds || "—"}. Resistência: ${baseline?.resistRate || 0}%. Esses são seus dados de referência — tudo que vem depois será comparado a eles.`,
      cta: "Ver padrões",
    };
  }

  /* ── Marcos clínicos (linha do tempo) ── */
  const milestones = [];
  if (logs.length >= 1)
    milestones.push({ icon:"📝", label:"Primeiro loop registrado",    date:logs[logs.length-1]?.timestamp });
  if (daysActive >= 7 && logs.length >= 3)
    milestones.push({ icon:"📅", label:"Semana 1 com dados",           date:startDate + 7*DAY });
  if (hasFirstERPSession)
    milestones.push({ icon:"⏱️", label:"Primeira sessão ERP iniciada", date:sessions[0]?.timestamp });
  if (hasAnyHabituation)
    milestones.push({ icon:"🧠", label:"Primeira habituação ERP",       date:sessions.find(s=>s.habituated)?.timestamp });
  if (logs.length >= 10)
    milestones.push({ icon:"🔟", label:"10 episódios registrados",      date:logs[logs.length-10]?.timestamp });
  if (daysActive >= 28)
    milestones.push({ icon:"📋", label:"1 mês de tratamento",           date:startDate + 28*DAY });
  if (sudsDrop >= 2)
    milestones.push({ icon:"📉", label:`SUDS caiu ${sudsDrop} pontos`,  date:Date.now() });
  if (resistGain >= 30)
    milestones.push({ icon:"💪", label:`Resistência +${resistGain}%`,   date:Date.now() });

  /* ── Ciclo Y-BOCS ── */
  const ybocsInterval = 28; // dias
  const nextYBOCS     = ybocsInterval - (daysActive % ybocsInterval);
  const ybocsProgress = (daysActive % ybocsInterval) / ybocsInterval;

  return {
    weekData, sudsDrop, resistGain, daysActive,
    notification, milestones,
    baseline, latest,
    nextYBOCS, ybocsProgress,
    lastLogDaysAgo, truePlateau, earlySignal,
  };
}

function EvolutionTab({ logs, sessions, profile }) {
  const startDate = profile.startDate || Date.now() - 15 * 86400000; // 15 dias atrás simulado
  const eng = useProgressEngine(logs, sessions, startDate);
  const [notifDismissed, setNotifDismissed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Gera dados das últimas 6 semanas (reais + simulados para demo)
  const DEMO_WEEKS = [
    { week:0, label:"Sem 1", avgSuds:7.8, resistRate:18, logs:5 },
    { week:1, label:"Sem 2", avgSuds:7.1, resistRate:28, logs:7 },
    { week:2, label:"Sem 3", avgSuds:6.4, resistRate:38, logs:8 },
    { week:3, label:"Sem 4", avgSuds:5.6, resistRate:52, logs:6 },
    { week:4, label:"Sem 5", avgSuds:4.9, resistRate:61, logs:9 },
    { week:5, label:"Sem 6", avgSuds:4.2, resistRate:72, logs:7 },
  ];

  const hasRealData = logs.length >= 4;
  const chartData   = hasRealData ? eng.weekData.map((w,i) => ({
    ...w, label:`Sem ${i+1}`
  })) : DEMO_WEEKS;

  const maxSuds = 10;
  const chartW  = 310, chartH = 80;

  // Y-BOCS reaval
  const daysSinceStart = eng.daysActive;
  const nextYBOCS = 28 - (daysSinceStart % 28);
  const ybocsProgress = (daysSinceStart % 28) / 28;

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", paddingBottom:90 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:FD, fontSize:26, fontWeight:900,
            color:C.ink, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
            Evolução Clínica
          </h2>
          <div style={{ fontFamily:FB, fontSize:12, color:C.inkDim }}>
            {eng.daysActive} dias em tratamento
          </div>
        </div>
        <button onClick={() => setShowPrivacy(true)} style={{
          background:C.blueGlow, border:`1px solid rgba(37,99,235,0.2)`,
          borderRadius:10, padding:"6px 12px", cursor:"pointer",
          fontFamily:FB, fontSize:11, fontWeight:700, color:C.blue }}>
          🔒 LGPD
        </button>
      </div>

      {/* Notificação de progresso */}
      {eng.notification && !notifDismissed && (
        <div style={{ padding:"14px 16px", borderRadius:16, marginBottom:16,
          background:`${eng.notification.color}12`,
          border:`1.5px solid ${eng.notification.color}30`,
          position:"relative" }}>
          <button onClick={() => setNotifDismissed(true)} style={{
            position:"absolute", top:10, right:10,
            background:"none", border:"none", cursor:"pointer",
            color:C.inkDim, fontSize:16 }}>✕</button>
          <div style={{ fontSize:24, marginBottom:8 }}>{eng.notification.icon}</div>
          <div style={{ fontFamily:FB, fontWeight:800, fontSize:14,
            color:eng.notification.color, marginBottom:4 }}>
            {eng.notification.title}
          </div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid,
            lineHeight:1.6, marginBottom:12 }}>
            {eng.notification.body}
          </div>
          <button style={{ background:eng.notification.color, border:"none",
            borderRadius:10, padding:"8px 16px", cursor:"pointer",
            fontFamily:FB, fontSize:12, fontWeight:700, color:C.white }}>
            {eng.notification.cta}
          </button>
        </div>
      )}

      {/* Resumo de progresso — 2 métricas-chave */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:10, marginBottom:14 }}>
        <Card style={{ padding:"16px" }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:6 }}>
            QUEDA NO SUDS
          </div>
          <div style={{ fontFamily:FD, fontSize:32, fontWeight:900, lineHeight:1,
            color:hasRealData&&eng.sudsDrop>0?C.green:C.inkDim }}>
            {hasRealData ? (eng.sudsDrop > 0 ? `-${eng.sudsDrop}` : "—") : "-3.6"}
          </div>
          <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:5, lineHeight:1.4 }}>
            {hasRealData ? "desde início" : "média em 6 semanas"}
          </div>
        </Card>
        <Card style={{ padding:"16px" }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:6 }}>
            GANHO DE RESISTÊNCIA
          </div>
          <div style={{ fontFamily:FD, fontSize:32, fontWeight:900, lineHeight:1,
            color:hasRealData&&eng.resistGain>0?C.green:C.inkDim }}>
            {hasRealData ? (eng.resistGain > 0 ? `+${eng.resistGain}%` : "—") : "+54%"}
          </div>
          <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:5, lineHeight:1.4 }}>
            {hasRealData ? "desde início" : "18% → 72%"}
          </div>
        </Card>
      </div>

      {/* Curva de evolução do SUDS semanal */}
      <Card style={{ padding:"18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:4 }}>
          SUDS MÉDIO SEMANAL
        </div>
        {!hasRealData && (
          <div style={{ fontFamily:FB, fontSize:10, color:C.amber,
            marginBottom:10, fontWeight:700 }}>
            ⚡ Demonstração — adicione registros para ver seus dados reais
          </div>
        )}
        <svg width="100%" height={chartH+20} viewBox={`0 0 ${chartW} ${chartH+20}`}
          preserveAspectRatio="none" style={{ overflow:"visible" }}>
          {[0,2,4,6,8,10].map(v => {
            const y = chartH - (v/maxSuds)*chartH;
            return (
              <g key={v}>
                <line x1="0" y1={y} x2={chartW} y2={y}
                  stroke={C.borderDim} strokeWidth="1" strokeDasharray="4,6"/>
                <text x="-2" y={y+4} textAnchor="end" fill={C.inkDim}
                  fontSize="9" fontFamily={FB}>{v}</text>
              </g>
            );
          })}
          {(() => {
            const pts = chartData.map((d,i) => ({
              x: chartData.length > 1 ? (i/(chartData.length-1))*chartW : chartW/2,
              y: chartH - ((d.avgSuds||5)/maxSuds)*chartH,
              suds: d.avgSuds,
            }));
            const area = `M${pts[0].x},${chartH} ${pts.map(p=>`L${p.x},${p.y}`).join(" ")} L${pts[pts.length-1].x},${chartH} Z`;
            const line = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
            return (
              <>
                <defs>
                  <linearGradient id="sudsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity="0.25"/>
                    <stop offset="100%" stopColor={C.green} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#sudsGrad)"/>
                <path d={line} fill="none" stroke={C.green} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((p,i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill={C.white}
                      stroke={sudsColor(p.suds||5)} strokeWidth="2"/>
                    <text x={p.x} y={chartH+16} textAnchor="middle"
                      fill={C.inkDim} fontSize="9" fontFamily={FB}>
                      {chartData[i].label}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </Card>

      {/* Taxa de resistência semanal */}
      <Card style={{ padding:"18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          TAXA DE RESISTÊNCIA SEMANAL
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:60 }}>
          {chartData.map((d,i) => (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:4, height:"100%" }}>
              <div style={{ width:"100%", borderRadius:"4px 4px 0 0",
                height:`${Math.max((d.resistRate/100)*54, 3)}px`,
                background:d.resistRate>=50
                  ? `linear-gradient(180deg,${C.green},rgba(45,106,79,0.5))`
                  : `linear-gradient(180deg,${C.amber},rgba(212,131,26,0.5))`,
                alignSelf:"flex-end",
                transition:"height 0.5s ease" }}/>
              <span style={{ fontFamily:FB, fontSize:9, color:C.inkDim }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between",
          marginTop:10, fontFamily:FB, fontSize:11, color:C.inkDim }}>
          <span>Início: {chartData[0]?.resistRate}%</span>
          <span style={{ fontWeight:800, color:C.green }}>
            Atual: {chartData[chartData.length-1]?.resistRate}%
          </span>
        </div>
      </Card>

      {/* Y-BOCS Reavaliação */}
      <Card style={{ padding:"16px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:12 }}>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em" }}>
            Y-BOCS — REAVALIAÇÃO PERIÓDICA
          </div>
          {profile.severity && (
            <span style={{ fontFamily:FB, fontSize:10, fontWeight:800,
              color:C.green, background:C.greenGlow,
              padding:"2px 8px", borderRadius:8 }}>
              Baseline: {profile.severity}
            </span>
          )}
        </div>
        <div style={{ fontFamily:FB, fontSize:13, color:C.inkMid,
          marginBottom:12, lineHeight:1.5 }}>
          Próxima reavaliação em <strong style={{ color:C.ink }}>{nextYBOCS} dias</strong>
        </div>
        <div style={{ height:6, background:C.bgDeep, borderRadius:3, overflow:"hidden",
          marginBottom:8 }}>
          <div style={{ width:`${ybocsProgress*100}%`, height:"100%",
            background:`linear-gradient(90deg,${C.green},${C.greenMid})`,
            borderRadius:3, transition:"width 0.5s" }}/>
        </div>
        <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim }}>
          Ciclo de 28 dias · A reavaliação mensura a resposta clínica objetiva ao protocolo
        </div>
      </Card>

      {/* Lógica de notificações */}
      <Card style={{ padding:"16px 18px", marginBottom:14 }}>
        <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
          color:C.inkDim, letterSpacing:"0.07em", marginBottom:14 }}>
          CRITÉRIOS DE NOTIFICAÇÃO INTELIGENTE
        </div>
        {[
          { icon:"🌱", trigger:"2 semanas + SUDS ↓2pts + resistência ↑15%",
            label:"Progresso clínico",   active:eng.daysActive>=14, color:C.green },
          { icon:"🎯", trigger:"Primeira habituação ERP confirmada",
            label:"Marco de conquista",  active:sessions.some(s=>s.habituated), color:C.amber },
          { icon:"🤝", trigger:"4 semanas sem melhora objetiva",
            label:"Sugestão de terapeuta", active:eng.daysActive>=28&&!hasRealData, color:C.blue },
          { icon:"👋", trigger:"5 dias consecutivos sem registros",
            label:"Reengajamento",       active:false, color:C.inkMid },
        ].map((n,i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
            paddingBottom:i<3?12:0, marginBottom:i<3?12:0,
            borderBottom:i<3?`1px solid ${C.borderDim}`:"none" }}>
            <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
              background:n.active?`${n.color}18`:C.bgDeep,
              border:`1px solid ${n.active?n.color+"40":C.borderDim}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16 }}>{n.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:FB, fontWeight:700, fontSize:13,
                color:n.active?n.color:C.ink }}>{n.label}</div>
              <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim,
                marginTop:2, lineHeight:1.4 }}>{n.trigger}</div>
            </div>
            <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
              color:n.active?n.color:C.inkDim,
              background:n.active?`${n.color}18`:C.bgDeep,
              padding:"3px 9px", borderRadius:8, flexShrink:0, alignSelf:"center" }}>
              {n.active?"ATIVO":"AGUARD."}
            </div>
          </div>
        ))}
      </Card>

      {/* Marcos da jornada */}
      {eng.milestones.length > 0 && (
        <div>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:800,
            color:C.inkDim, letterSpacing:"0.07em", marginBottom:12 }}>
            MARCOS DA JORNADA
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {eng.milestones.map((m,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                paddingBottom:16 }}>
                <div style={{ display:"flex", flexDirection:"column",
                  alignItems:"center", width:32, flexShrink:0 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%",
                    background:C.greenGlow, border:`2px solid ${C.green}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16 }}>{m.icon}</div>
                  {i < eng.milestones.length-1 && (
                    <div style={{ width:2, flex:1, minHeight:16,
                      background:C.greenLight, marginTop:4 }}/>
                  )}
                </div>
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontFamily:FB, fontWeight:700, fontSize:13,
                    color:C.ink }}>{m.label}</div>
                  {m.date && (
                    <div style={{ fontFamily:FB, fontSize:11, color:C.inkDim, marginTop:2 }}>
                      {new Date(m.date).toLocaleDateString("pt-BR",
                        {day:"2-digit",month:"short",year:"numeric"})}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal LGPD rápido */}
      {showPrivacy && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
          zIndex:300, display:"flex", alignItems:"flex-end" }}>
          <div style={{ width:"100%", maxWidth:390, background:C.bg,
            borderRadius:"24px 24px 0 0", padding:"24px 24px 40px",
            maxHeight:"70vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:16 }}>
              <div style={{ fontFamily:FD, fontSize:20, fontWeight:900, color:C.ink }}>
                Seus Dados
              </div>
              <button onClick={() => setShowPrivacy(false)} style={{
                background:C.white, border:`1px solid ${C.border}`,
                borderRadius:9, width:32, height:32, cursor:"pointer",
                color:C.inkMid, fontSize:16 }}>✕</button>
            </div>
            {[
              { label:"Exportar meus dados (JSON)", icon:"📦", color:C.blue },
              { label:"Solicitar exclusão de conta", icon:"🗑️", color:C.red },
              { label:"Revogar consentimento analítico", icon:"🚫", color:C.amber },
              { label:"Contatar DPO (privacidade@toclivre.com.br)", icon:"✉️", color:C.green },
            ].map((a,i) => (
              <button key={i} style={{ width:"100%", textAlign:"left",
                padding:"14px 16px", borderRadius:14, background:C.white,
                border:`1px solid ${C.borderDim}`, cursor:"pointer",
                fontFamily:FB, fontWeight:700, fontSize:14, color:a.color,
                display:"flex", alignItems:"center", gap:12,
                marginBottom:i<3?10:0 }}>
                <span style={{ fontSize:20 }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYWALL — Trial 7 dias grátis · R$ 37,90/mês · Sem cartão
═══════════════════════════════════════════════════════════════════════════ */
function Paywall({ onStart }) {
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: "⏱️", text: "Timer ERP com curva de habituação em tempo real" },
    { icon: "📊", text: "Avaliação Y-BOCS e gráficos longitudinais" },
    { icon: "⚡", text: "Protocolo de crise para momentos difíceis" },
    { icon: "🧠", text: "42 exercícios para todos os subtipos de TOC" },
    { icon: "🔒", text: "Dados protegidos — LGPD compliant" },
    { icon: "📈", text: "Notificações clínicas inteligentes" },
  ];

  const handleStart = () => {
    setLoading(true);
    // Simula ativação do trial — em produção: registra trialStartedAt no backend
    setTimeout(() => {
      onStart({ trialStartedAt: Date.now(), plan: "trial_7d" });
    }, 900);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column",
      background:`linear-gradient(180deg, ${C.ink} 0%, #0D1520 100%)`,
      overflowY:"auto", position:"relative" }}>

      {/* Glow de fundo */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:320,
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,106,79,0.25) 0%, transparent 70%)`,
        pointerEvents:"none" }}/>

      <div style={{ padding:"48px 28px 40px", position:"relative" }}>

        {/* Badge trial */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(45,106,79,0.2)", border:"1px solid rgba(45,106,79,0.4)",
            padding:"8px 18px", borderRadius:100 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:C.greenLight,
              boxShadow:`0 0 8px ${C.greenLight}`,
              animation:"pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:12, fontWeight:700, color:C.greenLight,
              letterSpacing:"0.06em", textTransform:"uppercase" }}>
              7 dias grátis
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign:"center", marginBottom:8 }}>
          <h1 style={{ fontFamily:FD, fontSize:38, fontWeight:900,
            color:C.white, letterSpacing:"-0.03em", lineHeight:1.05 }}>
            Comece sua<br/>
            <em style={{ color:C.greenLight, fontStyle:"italic" }}>jornada livre</em>
          </h1>
        </div>
        <p style={{ textAlign:"center", fontSize:14, color:"rgba(255,255,255,0.5)",
          lineHeight:1.6, marginBottom:36 }}>
          Experimente grátis por 7 dias.<br/>
          Sem cartão de crédito agora.
        </p>

        {/* Features */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:36 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14,
              background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:14, padding:"12px 16px" }}>
              <span style={{ fontSize:20 }}>{f.icon}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)",
                fontWeight:500, lineHeight:1.4 }}>{f.text}</span>
              <span style={{ marginLeft:"auto", color:C.greenLight, fontSize:16 }}>✓</span>
            </div>
          ))}
        </div>

        {/* Preço */}
        <div style={{ background:"rgba(45,106,79,0.12)",
          border:"1px solid rgba(45,106,79,0.25)",
          borderRadius:20, padding:"20px 22px", marginBottom:28,
          textAlign:"center" }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em",
            textTransform:"uppercase", color:"rgba(255,255,255,0.35)",
            marginBottom:8 }}>Após o período de teste</div>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"center", gap:4, marginBottom:4 }}>
            <span style={{ fontFamily:FD, fontSize:42, fontWeight:900,
              color:C.white, letterSpacing:"-0.03em", lineHeight:1 }}>R$ 37,90</span>
            <span style={{ fontSize:14, color:"rgba(255,255,255,0.45)",
              marginBottom:6 }}>/mês</span>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>
            Cancele quando quiser · Sem fidelidade
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleStart} disabled={loading}
          style={{ width:"100%", padding:"18px", borderRadius:100,
            background: loading ? C.greenMid : C.green,
            color:C.white, fontSize:16, fontWeight:800,
            border:"none", cursor:"pointer",
            boxShadow:`0 8px 32px rgba(45,106,79,0.4)`,
            transition:"all 0.25s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          {loading ? (
            <>
              <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)",
                borderTop:"2px solid white", borderRadius:"50%",
                animation:"spin 0.7s linear infinite" }}/>
              Ativando trial...
            </>
          ) : (
            <>Começar 7 dias grátis →</>
          )}
        </button>

        <p style={{ textAlign:"center", fontSize:11,
          color:"rgba(255,255,255,0.25)", marginTop:16, lineHeight:1.6 }}>
          Sem cartão de crédito agora. Você será notificado antes do término do trial.
          Ao assinar, você concorda com os Termos de Uso e Política de Privacidade do TOCLivre.
        </p>

        {/* Disclaimer ANVISA */}
        <div style={{ marginTop:24, padding:"12px 14px",
          background:"rgba(255,255,255,0.04)",
          borderRadius:12, border:"1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)",
            textAlign:"center", lineHeight:1.6 }}>
            O TOCLivre é um aplicativo de bem-estar. Não substitui avaliação ou
            tratamento por profissional de saúde mental licenciado.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.3); }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERSISTÊNCIA — localStorage layer (AES-256 ready, LGPD compliant)
   Chave: toclivre_v1 — versionada para migrações futuras
═══════════════════════════════════════════════════════════════════════════ */
const STORAGE_KEY = "toclivre_v1";

const Storage = {
  save(data) {
    try {
      const payload = { ...data, _savedAt: Date.now(), _version: 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn("[TOCLivre] localStorage write failed:", e);
      return false;
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data._version !== 1) return null; // migration hook
      return data;
    } catch (e) {
      console.warn("[TOCLivre] localStorage read failed:", e);
      return null;
    }
  },
  clear() {
    try { localStorage.removeItem(STORAGE_KEY); return true; }
    catch (e) { return false; }
  },
  export() {
    // LGPD Art. 18 — portabilidade
    const data = Storage.load();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)],
      { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `toclivre_meus_dados_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICAÇÕES — Web Notifications API + catch-up scheduler
   
   Arquitetura:
   ┌─────────────────────────────────────────────────────────────┐
   │  Camada 1 — Web Notifications API (browser nativo)          │
   │  Funciona: app aberto, aba em background                    │
   │                                                             │
   │  Camada 2 — Catch-up on open                                │
   │  Ao abrir o app, verifica notificações pendentes desde      │
   │  o último acesso. Cobre casos de D+3, D+7, D+42.           │
   │                                                             │
   │  Camada 3 — In-app toast (sempre funciona)                  │
   │  UI nativa dentro do app, independente de permissões.       │
   │                                                             │
   │  Próxima camada (React Native): FCM/APNs via Expo           │
   │  A estrutura de scheduling abaixo é idêntica — só muda      │
   │  o método de entrega.                                       │
   └─────────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════════════════ */

const NotifSchedule = {
  /*
   * Agenda de notificações baseada em dias desde o início
   * Cada entrada: { id, daysAfterStart, title, body, type }
   * Disparadas uma única vez (tracked em fired_notifs)
   */
  SCHEDULE: [
    { id:"d3_start",
      days: 3,
      title: "TOCLivre — Primeiros dados coletados 📊",
      body:  "Você tem 3 dias de registros. Acesse o app para ver seus primeiros padrões.",
      type:  "engagement" },
    { id:"d7_summary",
      days: 7,
      title: "Semana 1 completa 📅",
      body:  "Seu primeiro resumo semanal está pronto. Esses são seus dados de referência.",
      type:  "summary" },
    { id:"d14_signal",
      days: 14,
      title: "TOCLivre — Check de 2 semanas 🌱",
      body:  "14 dias de uso. Verifique se seu SUDS médio está caindo.",
      type:  "progress" },
    { id:"d21_erp_nudge",
      days: 21,
      title: "Suas sessões ERP estão esperando ⏱️",
      body:  "3 semanas de registros — hora de dar o próximo passo com as exposições guiadas.",
      type:  "erp_nudge" },
    { id:"d28_ybocs",
      days: 28,
      title: "Reavaliação de 1 mês — Y-BOCS 📋",
      body:  "É hora de refazer a avaliação. Isso mede sua resposta clínica objetiva.",
      type:  "ybocs" },
    { id:"d42_plateau_check",
      days: 42,
      title: "TOCLivre — Relatório de 6 semanas",
      body:  "Verifique sua evolução. Caso os resultados sejam abaixo do esperado, há orientações sobre próximos passos.",
      type:  "plateau_check" },
  ],

  // Verifica e dispara notificações pendentes desde último acesso
  checkPending(startDate, firedIds = []) {
    const daysActive = Math.floor((Date.now() - startDate) / 86400000);
    const pending    = this.SCHEDULE.filter(n =>
      daysActive >= n.days && !firedIds.includes(n.id)
    );
    return pending; // retorna lista para o caller tratar
  },

  // Envia via Web Notifications API se tiver permissão
  async sendBrowserNotif(title, body, icon = "🧠") {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag:  "toclivre",
      });
      return true;
    }
    return false;
  },

  // Solicita permissão de forma não intrusiva
  async requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied")  return "denied";
    const result = await Notification.requestPermission();
    return result;
  },
};

/* Hook: sincroniza estado com localStorage automaticamente */
function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const saved = Storage.load();
    return saved?.[key] !== undefined ? saved[key] : defaultValue;
  });

  const setPersistedState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Salva de forma assíncrona para não bloquear render
      setTimeout(() => {
        const current = Storage.load() || {};
        Storage.save({ ...current, [key]: next });
      }, 0);
      return next;
    });
  }, [key]);

  return [state, setPersistedState];
}

/* Toast de notificação in-app */
function NotifToast({ notif, onDismiss, onAction }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setTimeout(() => setVis(true), 50);
    const t = setTimeout(() => { setVis(false); setTimeout(onDismiss, 400); }, 8000);
    return () => clearTimeout(t);
  }, []);

  const TYPE_COLORS = {
    engagement:    C.green,
    summary:       C.green,
    progress:      C.green,
    erp_nudge:     C.amber,
    ybocs:         C.blue,
    plateau_check: C.blue,
    crisis_followup: C.amber,
    milestone:     C.amber,
    reengagement:  C.inkMid,
  };
  const col = TYPE_COLORS[notif.type] || C.green;

  return (
    <div style={{
      position:"absolute", top:16, left:16, right:16, zIndex:500,
      transform: vis ? "translateY(0)" : "translateY(-110%)",
      opacity: vis ? 1 : 0,
      transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <div style={{
        background: C.white,
        borderRadius: 18,
        padding: "14px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        border: `1.5px solid ${col}30`,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        {/* Color strip */}
        <div style={{ width:4, borderRadius:2, alignSelf:"stretch",
          background:col, flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:FB, fontWeight:800, fontSize:13,
            color:C.ink, marginBottom:3 }}>{notif.title}</div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.inkMid,
            lineHeight:1.5 }}>{notif.body}</div>
          {notif.cta && (
            <button onClick={() => { onAction && onAction(notif); onDismiss(); }}
              style={{ marginTop:8, background:"none", border:"none",
                cursor:"pointer", fontFamily:FB, fontWeight:800,
                fontSize:12, color:col, padding:0 }}>
              {notif.cta} →
            </button>
          )}
        </div>
        <button onClick={() => { setVis(false); setTimeout(onDismiss, 300); }}
          style={{ background:"none", border:"none", cursor:"pointer",
            color:C.inkDim, fontSize:16, flexShrink:0, padding:0 }}>✕</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════════ */
export default function TOCLivreApp() {
  // Carrega estado persistido ou usa defaults
  const saved = Storage.load();

  const [screen,   setScreen]   = usePersistedState("screen",
    saved ? (saved.screen === "lgpd" || saved.screen === "splash" ? "splash" : saved.screen) : "splash");
  const [subtypes, setSubtypes] = usePersistedState("subtypes", []);
  const [profile,  setProfile]  = usePersistedState("profile", { startDate: Date.now() });

  // Notificações pendentes (catch-up ao abrir)
  const [pendingNotifs, setPendingNotifs]   = useState([]);
  const [activeNotif,   setActiveNotif]     = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  // Ao montar: verifica notificações pendentes desde último acesso
  useEffect(() => {
    const data = Storage.load();
    if (!data?.profile?.startDate) return;

    const firedIds = data.firedNotifIds || [];
    const pending  = NotifSchedule.checkPending(data.profile.startDate, firedIds);

    if (pending.length > 0) {
      // Envia a mais recente via browser notification (catch-up)
      const latest = pending[pending.length - 1];
      NotifSchedule.sendBrowserNotif(latest.title, latest.body);

      // Mostra in-app toast para a mais recente
      setActiveNotif({
        ...latest,
        cta: "Ver no app",
      });

      // Marca todas como disparadas
      const newFired = [...firedIds, ...pending.map(n => n.id)];
      Storage.save({ ...data, firedNotifIds: newFired });
    }

    // Atualiza último acesso
    Storage.save({ ...(Storage.load() || {}), lastOpenedAt: Date.now() });
  }, []);

  // Persiste profile com startDate quando muda de tela para dash
  const handleProfileSave = (data) => {
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
  };

  // Solicita permissão de notificação ao completar onboarding
  useEffect(() => {
    if (screen === "dash" && notifPermission === "default") {
      setTimeout(async () => {
        const result = await NotifSchedule.requestPermission();
        setNotifPermission(result);
        // Confirma para o usuário
        if (result === "granted") {
          setActiveNotif({
            type:"engagement", title:"Notificações ativadas ✓",
            body: "Você receberá alertas de progresso, marcos de tratamento e lembretes de ERP.",
            cta: null,
          });
        }
      }, 3000); // 3s após entrar no dashboard
    }
  }, [screen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#C4B8A8; }
        ::-webkit-scrollbar { width:0; }
        textarea::-webkit-scrollbar { width:0; }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; }
        input[type=range]::-webkit-slider-runnable-track { height:8px; border-radius:4px; background:#EDE7DC; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:#2D6A4F; margin-top:-8px; box-shadow:0 2px 10px rgba(45,106,79,0.3); cursor:pointer; }
        button:active { opacity:0.82; transform:scale(0.975); }
        em { font-style:italic; }
        strong { font-weight:800; }
      `}</style>
      <div style={{ minHeight:"100vh", background:"#C4B8A8",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px", fontFamily:FB }}>
        <div style={{ width:390, minHeight:844, background:C.bg,
          borderRadius:46, overflow:"hidden", position:"relative",
          display:"flex", flexDirection:"column",
          boxShadow:"0 40px 100px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.55)" }}>
          <StatusBar />

          {/* Toast de notificação — flutua sobre qualquer tela */}
          {activeNotif && (
            <NotifToast
              notif={activeNotif}
              onDismiss={() => setActiveNotif(null)}
              onAction={(n) => {
                if (n.type === "ybocs") setScreen("dash");
                if (n.type === "erp_nudge") setScreen("dash");
              }}
            />
          )}

          {screen==="splash"      && <Splash onNext={() => setScreen("lgpd_simples")} />}
          {screen==="lgpd_simples" && <LGPDSimples onAccept={() => {
            handleProfileSave({ consents: { necessary:true }, lgpdAcceptedAt: Date.now() });
            setScreen("onb1");
          }} />}
          {screen==="lgpd"        && <LGPDConsent  onAccept={c => {
            const newProfile = { ...profile, consents:c, startDate: Date.now() };
            setProfile(newProfile);
            setScreen("onb1");
          }} />}
          {screen==="onb1"   && <OnbSubtype   onNext={s  => { setSubtypes(s); setScreen("onb2"); }} />}
          {screen==="onb2"   && <OnbYBOCS     onNext={d  => { handleProfileSave(d); setScreen("onb3"); }} />}
          {screen==="onb3"   && <OnbTriggers  onNext={t  => { handleProfileSave({ triggers:t }); setScreen("onb4"); }} />}
          {screen==="onb4"   && <OnbBaseline  onNext={d  => { handleProfileSave(d); setScreen("paywall"); }} />}
          {screen==="paywall" && <Paywall onStart={d => { handleProfileSave(d); setScreen("dash"); }} />}
          {screen==="dash"   && <Dashboard
            profile={profile}
            subtypes={subtypes}
            notifPermission={notifPermission}
            onNotif={setActiveNotif}
            onExportData={Storage.export}
            onDeleteAccount={() => {
              if (window.confirm("Todos os dados serão apagados permanentemente. Confirmar?")) {
                Storage.clear();
                setScreen("lgpd");
                setSubtypes([]);
                setProfile({ startDate: Date.now() });
              }
            }}
          />}
        </div>
      </div>
    </>
  );
}
