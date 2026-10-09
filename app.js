/*!
 * Saúde Mental Gratuita — Rio de Janeiro
 * Copyright (c) 2026 José Henrique Macedo de Oliveira
 *
 * Autor: José Henrique Macedo de Oliveira
 * Licença: MIT — é obrigatório manter este aviso de direitos autorais
 * em todas as cópias ou partes substanciais do código (veja o arquivo LICENSE).
 */

    (function(){
      // ---- Calibração pixel <-> lat/lon da imagem embutida (888x588 px) ----
      // Ajuste linear feito a partir de pontos de referência reais do Centro do Rio
      // (Central do Brasil, Praça XV, Cinelândia, Arcos da Lapa, Glória).
      const IMG_W = 1860, IMG_H = 818;
      const COEF_X = { a: 13637.906830596934, b: 2137.073684576797, c: 638675.3486653455 };
      const COEF_Y = { d: -933.2790605136937, e: -23227.310794473615, f: -572074.3018120336 };
      const MINV = { a: 7.37896358837859e-05, b: 6.78915826447124e-06, c: -2.964885718481554e-06, d: -4.332555706303195e-05 };

      function lonLatToPx(lon, lat){
        return {
          x: COEF_X.a*lon + COEF_X.b*lat + COEF_X.c,
          y: COEF_Y.d*lon + COEF_Y.e*lat + COEF_Y.f
        };
      }
      function pxToLonLat(px, py){
        const dx = px - COEF_X.c, dy = py - COEF_Y.f;
        return {
          lon: MINV.a*dx + MINV.b*dy,
          lat: MINV.c*dx + MINV.d*dy
        };
      }

      function haversine(lat1, lon1, lat2, lon2){
        const R = 6371000;
        const toRad = d => d * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      }

      // ---- Unidades públicas/gratuitas de saúde mental (Centro do RJ e entorno) ----
      const clinics = [
        {
          name: "CAP 1.0 — Coordenadoria de Saúde AP 1.0",
          type: "Coordenação da rede municipal",
          address: "R. Evaristo da Veiga, 16 — Centro",
          phone: "+552132331177",
          phoneDisplay: "(21) 3233-1177",
          hours: "Seg–Sex, 7h–17h",
          note: "Direciona para CAPS e demais serviços de saúde mental da região central.",
          ageGroups: ['adultos','menores'],
          categories: ['saude-geral', 'coordenacao'],
          lat: -22.9098245, lon: -43.17707
        },
        {
          name: "CMS Oswaldo Cruz",
          type: "Centro Municipal de Saúde (SUS)",
          address: "Av. Henrique Valadares, 151 — Centro",
          phone: "+552121511751",
          phoneDisplay: "(21) 2151-1751",
          hours: "Seg–Sex 7h–18h · Sáb 7h–12h",
          note: "Atendimento clínico geral; procure a triagem para encaminhamento psicológico/psiquiátrico gratuito.",
          ageGroups: ['adultos','menores'],
          categories: ['saude-geral'],
          lat: -22.9130011, lon: -43.190735
        },
        {
          name: "CER Centro",
          type: "Emergência / pronto atendimento (SUS)",
          address: "R. Frei Caneca, 8 — Centro",
          phone: "",
          phoneDisplay: "",
          hours: "24 horas",
          note: "Pode orientar e encaminhar casos de urgência em saúde mental no Centro.",
          ageGroups: ['adultos','menores'],
          categories: ['urgencia', 'saude-geral'],
          lat: -22.9086987, lon: -43.1904909
        },
        {
          name: "Policlínica Geral do Rio de Janeiro",
          type: "Policlínica pública",
          address: "Av. Nilo Peçanha, 38 — Centro",
          phone: "+552125441068",
          phoneDisplay: "(21) 2544-1068",
          hours: "Seg–Sex 7h–12h",
          note: "Diversas especialidades; consulte a disponibilidade de psicologia/psiquiatria.",
          ageGroups: ['adultos','menores'],
          categories: ['saude-geral'],
          lat: -22.9062545, lon: -43.1749618
        },
        {
          name: "Centro Psiquiátrico do Rio de Janeiro (CPRJ)",
          type: "Hospital psiquiátrico público",
          address: "R. do Propósito, 231 — Gamboa",
          phone: "+552122025400",
          phoneDisplay: "(21) 2202-5400",
          hours: "24 horas",
          note: "Referência pública em saúde mental, com ambulatório e urgência.",
          ageGroups: ['adultos','menores'],
          categories: ['psiquiatria', 'urgencia'],
          lat: -22.8949802, lon: -43.1911039
        },
        {
          name: "CMS Ernani Agrícola",
          type: "Centro Municipal de Saúde (SUS)",
          address: "R. Constante Jardim, 8 — Santa Teresa",
          phone: "+552122247194",
          phoneDisplay: "(21) 2224-7194",
          hours: "Seg–Sex 7h–18h · Sáb 8h–13h",
          note: "Unidade próxima ao Centro, com atendimento clínico e encaminhamento em saúde mental.",
          ageGroups: ['adultos','menores'],
          categories: ['saude-geral'],
          lat: -22.9212996, lon: -43.1892558
        },
        {
          name: "Serviço de Psicologia PUC-Rio",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Rua Marquês de São Vicente, 225 — Gávea",
          phone: "+552135271574",
          phoneDisplay: "(21) 3527-1574 / (21) 3527-1575",
          website: "http://www.psi.puc-rio.br/site/index.php/spa-servicos",
          note: "WhatsApp (21) 99328-2539. Site com link para inscrição.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9789, lon: -43.2334
        },
        {
          name: "Serviço de Psicologia Aplicada UFF",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Campus do Gragoatá, Bloco N, 5º andar — Niterói",
          phone: "+552126292300",
          phoneDisplay: "(21) 2629-2300",
          hours: "Seg–Sex, 7h às 19h",
          website: "https://spa.sites.uff.br",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.8993, lon: -43.1229
        },
        {
          name: "Serviço de Psicologia Aplicada FAMATH",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Av. Visconde do Rio Branco, 869 — São Domingos, Niterói",
          phone: "+552127073502",
          phoneDisplay: "(21) 2707-3502 / (21) 2707-3527",
          hours: "Seg–Sex 8h–22h · Sáb 8h–12h",
          note: "E-mail: spa@famath.com.br",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.8972, lon: -43.1214
        },
        {
          name: "Serviço de Psicologia Aplicada Estácio — Campus Rebouças",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Rua Paula Frassinetti, 42 — Rio Comprido",
          phone: "+552125037183",
          phoneDisplay: "(21) 2503-7183 / (21) 2503-7253",
          hours: "Seg 7h–23h · Ter–Sex 8h–22h",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9155, lon: -43.2207
        },
        {
          name: "Serviço de Psicologia Aplicada Estácio — Campus João Uchôa",
          type: "Plantão Psicológico (pronto atendimento, universitário)",
          address: "Rua do Bispo, 83 — Rio Comprido",
          phone: "+552140036767",
          phoneDisplay: "(21) 4003-6767 / (21) 2583-7116",
          note: "Oferece pronto atendimento através do Serviço de Plantão Psicológico.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'plantao'],
          lat: -22.9105, lon: -43.2299
        },
        {
          name: "Serviço de Psicologia Aplicada Estácio — Norte Shopping",
          type: "Plantão Psicológico (pronto atendimento, universitário)",
          address: "Av. Dom Helder Câmara, 5080 — Norte Shopping",
          phone: "+552125837116",
          phoneDisplay: "(21) 2583-7116",
          note: "Oferece pronto atendimento através do Serviço de Plantão Psicológico.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'plantao'],
          lat: -22.8845, lon: -43.2727
        },
        {
          name: "Serviço de Psicologia Aplicada Veiga de Almeida — Cabo Frio",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Estrada Perynas, s/n — Cabo Frio",
          phone: "+552226401637",
          phoneDisplay: "(22) 2640-1637",
          hours: "Seg–Sex 8h–21h",
          note: "Interessados devem comparecer ao endereço, preencher uma ficha e aguardar a fila de espera.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.8894, lon: -42.0286
        },
        {
          name: "Serviço de Psicologia Aplicada Veiga de Almeida — Barra",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Gal. Felicíssimo Cardoso, 500 — Barra da Tijuca",
          phone: "+552125748888",
          phoneDisplay: "(21) 2574-8888",
          hours: "Seg–Sex 8h–17h",
          note: "Interessados devem comparecer ao endereço, preencher uma ficha e aguardar a fila de espera.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -23.0045, lon: -43.3654
        },
        {
          name: "Serviço de Psicologia Aplicada Veiga de Almeida — Tijuca",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Rua Ibituruna, 108 — Casa 4, Tijuca",
          phone: "+552125748898",
          phoneDisplay: "(21) 2574-8898",
          hours: "Seg–Sex 8h–21h",
          note: "Interessados devem comparecer ao endereço, preencher uma ficha e aguardar a fila de espera.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9270, lon: -43.2340
        },
        {
          name: "Entrelaços — Ambulatório do Luto",
          type: "Atendimento psicológico de luto (online ou presencial)",
          address: "Rua Barão do Flamengo, 22, sala 903 — Flamengo",
          phone: "+552122256155",
          phoneDisplay: "(21) 2225-6155 / (21) 97954-3131",
          note: "E-mail: ambulatoriodoluto@gmail.com",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'luto'],
          lat: -22.9319, lon: -43.1786
        },
        {
          name: "Círculo Psicanalítico do Rio de Janeiro",
          type: "Psicanálise (social/gratuito, com lista de espera)",
          address: "Rua David Campista, 170 — Botafogo",
          phone: "+552122866922",
          phoneDisplay: "(21) 2286-6922 / (21) 2286-6812",
          hours: "Seg–Sex 9h–16h",
          note: "Os interessados devem comparecer à instituição para inscrição e agendar entrevista de triagem.",
          ageGroups: ['adultos','menores'],
          categories: ['psicanalise'],
          lat: -22.9541, lon: -43.1897
        },
        {
          name: "Serviço de Psicologia Aplicada IBMR — Catete",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Rua Corrêa Dutra, 133 — Catete",
          phone: "+552125570001",
          phoneDisplay: "(21) 2557-0001",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9285, lon: -43.1771
        },
        {
          name: "Serviço de Psicologia Aplicada IBMR — Barra",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Av. das Américas, 2603 — Barra da Tijuca",
          phone: "+552135441187",
          phoneDisplay: "(21) 3544-1187",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -23.0016, lon: -43.3592
        },
        {
          name: "Serviço de Psicologia Aplicada UFRJ — Praia Vermelha",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Av. Pasteur, 250 — Botafogo",
          phone: "+552122958113",
          phoneDisplay: "(21) 2295-8113",
          hours: "Seg–Sex 8h–20h",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9508, lon: -43.1654
        },
        {
          name: "Serviço de Psicologia Aplicada UERJ",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Rua São Francisco Xavier, 524 — 10º andar, Maracanã",
          phone: "+552123340033",
          phoneDisplay: "(21) 2334-0033 / (21) 2334-0688",
          website: "http://www.psicologia.uerj.br/SPA.html",
          note: "Entre no site para conferir agenda de atendimento.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9111, lon: -43.2325
        },
        {
          name: "Serviço de Psicologia Aplicada Santa Úrsula",
          type: "Serviço de Psicologia (universitário, social/gratuito)",
          address: "Fernando Ferrari, 75 — Botafogo",
          phone: "+552123232000",
          phoneDisplay: "(21) 2323-2000 — Ramal 210",
          hours: "Seg–Sex 9h–17h",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9535, lon: -43.1858
        },
        {
          name: "Instituto da Família (INFA) — Tijuca",
          type: "Atendimento psicológico social/gratuito",
          address: "Rua Alzira Brandão, 459 — Tijuca",
          phone: "+552125679899",
          phoneDisplay: "(21) 2567-9899",
          note: "E-mail: infatijuca@ig.com.br",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'apoio-familia'],
          lat: -22.9260, lon: -43.2330
        },
        {
          name: "Instituto da Família (INFA) — Eng. de Dentro",
          type: "Atendimento psicológico social/gratuito",
          address: "Rua Goiás, 132 — Eng. de Dentro",
          phone: "+552122690896",
          phoneDisplay: "(21) 2269-0896",
          note: "E-mail: infaengedentro@ig.com.br",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'apoio-familia'],
          lat: -22.8873, lon: -43.2848
        },
        {
          name: "Instituto da Família (INFA) — Itanhangá",
          type: "Atendimento psicológico social/gratuito",
          address: "Rua Pau Brasil, 4 — Itanhangá",
          phone: "+552131542003",
          phoneDisplay: "(21) 3154-2003",
          note: "E-mail: infaitanhanga@ig.com.br",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia', 'apoio-familia'],
          lat: -22.9927, lon: -43.3122
        },
        {
          name: "Instituto de Psicologia Gestalt em Figura",
          type: "Atendimento social (lista de espera, valores acessíveis)",
          address: "Próximo à Estação de Metrô Largo do Machado",
          phone: "+552122059021",
          phoneDisplay: "(21) 2205-9021 / (21) 99773-1834",
          note: "Marcar entrevista apenas por telefone.",
          ageGroups: ['adultos','menores'],
          categories: ['psicologia'],
          lat: -22.9316, lon: -43.1789
        },
        {
          name: "Sociedade Brasileira de Psicanálise do Rio de Janeiro",
          type: "Psicanálise (inscrição presencial)",
          address: "Rua David Campista, 80 — Humaitá",
          phone: "+552125371333",
          phoneDisplay: "(21) 2537-1333 / (21) 2537-1115",
          hours: "Seg–Qui 9h–17h",
          note: "Inscrições devem ser feitas presencialmente.",
          ageGroups: ['adultos','menores'],
          categories: ['psicanalise'],
          lat: -22.9550, lon: -43.1932
        },
        {
          name: "Sociedade de Psicanálise Iracy Doyle",
          type: "Psicanálise (entrevista por telefone)",
          address: "Visconde de Pirajá, 156, salas 307/310 — Ipanema",
          phone: "+552125220032",
          phoneDisplay: "(21) 2522-0032",
          hours: "Seg–Sex, ligar entre 9h e 21h",
          note: "Interessados devem ligar para marcar uma entrevista.",
          ageGroups: ['adultos','menores'],
          categories: ['psicanalise'],
          lat: -22.9838, lon: -43.2044
        },
        {
          name: "Mapa do Acolhimento",
          type: "Atendimento psicológico virtual (exclusivo para mulheres)",
          address: "Atendimento 100% online — sem endereço físico",
          phone: "",
          phoneDisplay: "",
          note: "Serviço exclusivo para mulheres maiores de 18 anos. Contato pelo Instagram @mapadoacolhimento.",
          ageGroups: ['adultos'],
          categories: ['apoio-social'],
          lat: -22.9098, lon: -43.1807
        },
        {
          name: "Clínica do ICP — Copacabana",
          type: "CAPS / Clínica de saúde mental",
          address: "Copacabana",
          phone: "+5521936180711",
          phoneDisplay: "(21) 93618-0711 (WhatsApp)",
          website: "https://saude.prefeitura.rio/caps/",
          ageGroups: ['adultos','menores'],
          categories: ['caps'],
          lat: -22.9707, lon: -43.1875
        },
        {
          name: "Rede CAPS AD — Diretório oficial (Prefeitura do Rio)",
          type: "CAPS AD — álcool e outras drogas (diretório de unidades)",
          address: "Consulte no site a unidade de CAPS AD mais próxima da sua casa",
          phone: "1746",
          phoneDisplay: "1746 (Central de Atendimento ao Cidadão)",
          website: "https://saude.prefeitura.rio/caps/",
          note: "Não tenho o endereço exato de cada CAPS AD confirmado — use o site oficial ou ligue 1746 para localizar a unidade mais perto de você.",
          ageGroups: ['adultos','menores'],
          categories: ['caps','caps-ad'],
          lat: -22.9068, lon: -43.1729
        },
        {
          name: "CAPS III Franco Basaglia",
          type: "CAPS III (24h) — SUS",
          address: "Av. Venceslau Brás, 65 (fundos) — Botafogo",
          phone: "+552123421765",
          phoneDisplay: "(21) 2342-1765 / (21) 2234-1765",
          phone2: "+552122341765",
          hours: "24 horas",
          note: "Acolhimento contínuo e acompanhamento de transtornos mentais graves. Atende a AP 2.1 (Glória, Catete, Laranjeiras, Botafogo, Urca, Humaitá, Copacabana e Leme).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          lat: -22.9527, lon: -43.17583
        },
        {
          name: "CAPS AD III Carolina Maria de Jesus",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. da Emancipação, 9 — São Cristóvão",
          hours: "Seg–Sex, 8h–17h (confirme o horário antes de ir)",
          note: "Atende pessoas com necessidades decorrentes do uso de álcool e outras drogas. Área: AP 1.0 (Centro, Santa Teresa, Estácio, São Cristóvão, Benfica e arredores).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          lat: -22.8990, lon: -43.2277
        },
        {
          name: "CAPS AD II Heleno de Freitas",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Dona Mariana, 151 — Botafogo",
          phone: "+552123421775",
          phoneDisplay: "(21) 2342-1775 / (21) 2334-8109",
          phone2: "+552123348109",
          hours: "Seg–Sex, 8h–17h",
          note: "Unidade especializada em álcool e outras drogas (AP 2.1), com acesso fácil a partir da região central.",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          lat: -22.9545, lon: -43.18782
        },
        {
          name: "CAPSi III Maurício de Sousa",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "Av. Venceslau Brás, 65 C (fundos) — Botafogo",
          phone: "+552130962850",
          phoneDisplay: "(21) 3096-2850",
          hours: "Seg–Sáb, 9h–17h (confirme o horário antes de ir)",
          note: "Atendimento especializado em saúde mental para crianças e adolescentes. Atende Centro e parte da Zona Sul (AP 1.0 e 2.1).",
          ageGroups: ['menores'],
          categories: ['caps'],
          lat: -22.95262, lon: -43.17574
        },
        {
          name: "CAPSi II Carim",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "Av. Venceslau Brás, 71 — Botafogo",
          hours: "Seg–Sex, 8h–17h",
          note: "Voltado ao atendimento infantojuvenil no âmbito da saúde mental pública. Ligue antes para confirmar o atendimento.",
          ageGroups: ['menores'],
          categories: ['caps'],
          lat: -22.95285, lon: -43.17566
        },
        {
          name: "CAPS II Carlos Augusto Magal",
          type: "CAPS II — SUS",
          address: "Av. Dom Hélder Câmara, 1184 (fundos) — Benfica",
          phone: "+552120429967",
          phoneDisplay: "(21) 2042-9967",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende a região da AP 1.0 / AP 3.1 (Benfica, Manguinhos, Maré e arredores) com suporte multiprofissional contínuo.",
          ageGroups: ['adultos'],
          categories: ['caps'],
          lat: -22.8868, lon: -43.2504
        },
        {
          name: "CAPS III Maria do Socorro Santos",
          type: "CAPS III — SUS · 24h",
          address: "Estrada da Gávea, 522 — Rocinha",
          phone: "+5521998947090",
          phoneDisplay: "(21) 99894-7090",
          hours: "24 horas",
          note: "Atende: Rocinha, Vidigal, São Conrado, Gávea, Ipanema, Lagoa e Jardim Botânico. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.989, lon: -43.248
        },
        {
          name: "CAPS II Universitário UERJ",
          type: "CAPS II — SUS",
          address: "Av. Marechal Rondon, 381 — São Francisco Xavier",
          phone: "+552125667372",
          phoneDisplay: "(21) 2566-7372 / (21) 2566-7371",
          phone2: "+552125667371",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Parte da Grande Tijuca: Grajaú, Andaraí, Vila Isabel e Praça da Bandeira. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.9115, lon: -43.2395
        },
        {
          name: "CAPSi II Ziraldo",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Mata Machado, 29 — Maracanã",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Grande Tijuca: Andaraí, Grajaú, Vila Isabel, Tijuca, Praça da Bandeira e Alto da Boa Vista. Telefone não divulgado na lista oficial; use o 1746. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.915, lon: -43.228
        },
        {
          name: "CAPS AD II Mané Garrincha",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Jurupari, 8 — Tijuca",
          phone: "+552122846339",
          phoneDisplay: "(21) 2284-6339",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Grande Tijuca: Andaraí, Grajaú, Vila Isabel, Tijuca, Praça da Bandeira e Alto da Boa Vista. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.926, lon: -43.235
        },
        {
          name: "CAPSi II Visconde Sabugosa",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "Av. Guanabara, s/nº — Praia de Ramos",
          phone: "+552138849635",
          phoneDisplay: "(21) 3884-9635",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Alemão, Manguinhos, Maré, Bonsucesso, Olaria, Penha, Vigário Geral, Brás de Pina e arredores. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.845, lon: -43.268
        },
        {
          name: "CAPS III Ernesto Nazareth",
          type: "CAPS III — SUS · 24h",
          address: "Estrada do Cacuia, 869 — Ilha do Governador",
          phone: "+552139592720",
          phoneDisplay: "(21) 3959-2720",
          hours: "24 horas",
          note: "Atende: Ilha do Governador. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8085, lon: -43.202
        },
        {
          name: "CAPSi II Guttmann Bicho",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "Av. Paranapuan, 435 — Ilha do Governador",
          phone: "+552139592725",
          phoneDisplay: "(21) 3959-2725",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Ilha do Governador. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.7925, lon: -43.21
        },
        {
          name: "CAPS III Fernando Diniz",
          type: "CAPS III — SUS · 24h",
          address: "R. Leopoldina Rego, 754 — Olaria",
          phone: "+552130853738",
          phoneDisplay: "(21) 3085-3738 / (21) 3085-3739",
          phone2: "+552130853739",
          hours: "24 horas",
          note: "Atende: Olaria, Ramos, Bonsucesso, Penha e Brás de Pina. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.846, lon: -43.259
        },
        {
          name: "CAPS AD III Miriam Makeba",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Professor Lacê, 485 — Ramos",
          phone: "+552139592721",
          phoneDisplay: "(21) 3959-2721 / (21) 99844-9888",
          phone2: "+5521998449888",
          hours: "24 horas",
          note: "Atende: Ilha do Governador, Alemão, Manguinhos, Maré, Bonsucesso, Olaria, Penha e arredores. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.849, lon: -43.253
        },
        {
          name: "CAPS III João Ferreira Silva Filho",
          type: "CAPS III — SUS · 24h",
          address: "Estrada do Itararé, 951 — Ramos",
          phone: "+552139503749",
          phoneDisplay: "(21) 3950-3749",
          hours: "24 horas",
          note: "Atende: Complexo do Alemão. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.852, lon: -43.253
        },
        {
          name: "CAPS III Clarice Lispector",
          type: "CAPS III — SUS · 24h",
          address: "R. Dois de Fevereiro, 785-A — Encantado",
          phone: "+552131117490",
          phoneDisplay: "(21) 3111-7490",
          hours: "24 horas",
          note: "Atende: Méier e adjacências. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8985, lon: -43.2905
        },
        {
          name: "CAPS III Torquato Neto",
          type: "CAPS III — SUS · 24h",
          address: "Estrada Adhemar Bebiano, 339 — Del Castilho",
          phone: "+5521970275461",
          phoneDisplay: "(21) 97027-5461",
          hours: "24 horas",
          note: "Atende: Abolição, Pilares, Engenho da Rainha, Tomás Coelho, Todos os Santos, Higienópolis e Jacarezinho. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.873, lon: -43.278
        },
        {
          name: "CAPS III EAT Severino dos Santos",
          type: "CAPS III — SUS · 24h",
          address: "R. Dois de Fevereiro, 635 — Encantado",
          phone: "+552120422851",
          phoneDisplay: "(21) 2042-2851",
          hours: "24 horas",
          note: "Atende: Jacaré, Rocha, Sampaio, São Francisco Xavier e Riachuelo. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8985, lon: -43.29
        },
        {
          name: "CAPS AD III Raul Seixas",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Dois de Fevereiro, 785 — Encantado",
          phone: "+552120423210",
          phoneDisplay: "(21) 2042-3210 / (21) 96518-0829",
          phone2: "+5521965180829",
          hours: "24 horas",
          note: "Atende: Abolição, Pilares, Engenho da Rainha, Todos os Santos, Jacaré, Rocha, Sampaio, Méier e adjacências. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8985, lon: -43.2905
        },
        {
          name: "CAPSi III Maria Clara Machado",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Honório, 461 — Todos os Santos",
          phone: "+552130853724",
          phoneDisplay: "(21) 3085-3724 / (21) 3085-3717",
          phone2: "+552130853717",
          hours: "24 horas",
          note: "Atende: Abolição, Pilares, Engenho da Rainha, Todos os Santos, Jacaré, Rocha, Sampaio, Méier e adjacências. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8975, lon: -43.2845
        },
        {
          name: "CAPS II Dircinha e Linda Batista",
          type: "CAPS II — SUS",
          address: "R. Jornalista Hermano Requião, 447 — Guadalupe/Anchieta",
          phone: "+5521965181070",
          phoneDisplay: "(21) 96518-1070",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Guadalupe, Anchieta, Ricardo de Albuquerque, Fazenda Botafogo, Acari, Pavuna e Osvaldo Cruz. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.845, lon: -43.37
        },
        {
          name: "CAPS III Rubens Corrêa",
          type: "CAPS III — SUS · 24h",
          address: "R. Capitão Aliatar Martins, 231 — Irajá",
          phone: "+552125014118",
          phoneDisplay: "(21) 2501-4118",
          hours: "24 horas",
          note: "Atende: Irajá, Cascadura, Madureira, Vila da Penha, Bento Ribeiro, Rocha Miranda, Vaz Lobo e arredores. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.8315, lon: -43.333
        },
        {
          name: "CAPS AD III Dona Ivone Lara",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "Av. Ernani Cardoso, 21 — Cascadura",
          hours: "24 horas",
          note: "Atende: Cascadura, Quintino, Campinho, Engenheiro Leal e Cavalcanti. Telefone não divulgado na lista oficial; use o 1746. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.88, lon: -43.34
        },
        {
          name: "CAPS AD III Paulo Portela",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Pirapora, 69 — Madureira",
          phone: "+552130969669",
          phoneDisplay: "(21) 3096-9669",
          hours: "24 horas",
          note: "Atende: Guadalupe, Anchieta, Pavuna, Osvaldo Cruz, Irajá, Madureira, Vila da Penha e arredores. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.873, lon: -43.337
        },
        {
          name: "CAPSi II Heitor Villa Lobos",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Padre Manso, s/nº — Madureira",
          phone: "+552120846071",
          phoneDisplay: "(21) 2084-6071 / (21) 97958-8206",
          phone2: "+5521979588206",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Guadalupe, Cascadura, Anchieta, Pavuna, Irajá, Madureira, Vila da Penha, Quintino e arredores. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.873, lon: -43.337
        },
        {
          name: "CAPS III Arthur Bispo do Rosário",
          type: "CAPS III — SUS · 24h",
          address: "Av. Teixeira Brandão, s/nº — Jacarepaguá",
          phone: "+552134125608",
          phoneDisplay: "(21) 3412-5608 / (21) 3412-5619",
          phone2: "+552134125619",
          hours: "24 horas",
          note: "Atende: Jacarepaguá: Anil, Colônia, Freguesia, Itanhangá, Pechincha, Praça Seca, Taquara e Tanque. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.925, lon: -43.36
        },
        {
          name: "CAPS III Manoel de Barros",
          type: "CAPS III — SUS · 24h",
          address: "Av. Nossa Senhora dos Remédios, s/nº — Taquara",
          phone: "+552130965965",
          phoneDisplay: "(21) 3096-5965",
          hours: "24 horas",
          note: "Atende: Cidade de Deus, Curicica, Camorim, Itanhangá, Barra da Tijuca, Recreio e Vargens. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.93, lon: -43.368
        },
        {
          name: "CAPS AD III Antônio Carlos Mussum",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Sampaio Corrêa, s/nº — Taquara",
          phone: "+552120423683",
          phoneDisplay: "(21) 2042-3683",
          hours: "24 horas",
          note: "Atende: Barra, Recreio, Vargem Grande, Vargem Pequena, Camorim, Praça Seca e Vila Valqueire. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.93, lon: -43.369
        },
        {
          name: "CAPS AD III Jovelina Pérola Negra",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "Estrada Rodrigues Caldas, 3400 — Taquara",
          hours: "24 horas",
          note: "Atende: Muzema, Colônia e Curicica. Telefone não divulgado na lista oficial; use o 1746. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.925, lon: -43.37
        },
        {
          name: "CAPSi III Eliza Santa Roza",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Sampaio Correia, 105 — Taquara",
          phone: "+552134125601",
          phoneDisplay: "(21) 3412-5601 / (21) 3412-5605",
          phone2: "+552134125605",
          hours: "24 horas",
          note: "Atende: Barra, Recreio, Vargens, Curicica, Camorim, Praça Seca, Vila Valqueire e Jacarepaguá. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.9305, lon: -43.368
        },
        {
          name: "CAPS III Lima Barreto",
          type: "CAPS III — SUS · 24h",
          address: "Av. Ribeiro Dantas, 571 — Bangu",
          phone: "+552134625449",
          phoneDisplay: "(21) 3462-5449",
          hours: "24 horas",
          note: "Atende: Bangu e Padre Miguel. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.878, lon: -43.465
        },
        {
          name: "CAPS II Neusa Santos Souza",
          type: "CAPS II — SUS",
          address: "R. Baalbeck, 75 — Senador Camará",
          phone: "+552136138285",
          phoneDisplay: "(21) 3613-8285 / (21) 97011-4479",
          phone2: "+5521970114479",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Sulacap, Senador Camará, Deodoro e Magalhães Bastos. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.872, lon: -43.487
        },
        {
          name: "CAPSi II Pequeno Hans",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Carlos Pontes, s/nº — Jardim Sulacap",
          phone: "+552133553887",
          phoneDisplay: "(21) 3355-3887",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Bangu, Padre Miguel, Sulacap, Senador Camará, Deodoro e Magalhães Bastos. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.89, lon: -43.41
        },
        {
          name: "CAPS II Pedro Pellegrino",
          type: "CAPS II — SUS",
          address: "Praça Major Vieira de Mello, 13 (fundos) — Comari, Campo Grande",
          phone: "+552133942583",
          phoneDisplay: "(21) 3394-2583",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Campo Grande, Santíssimo e Guaratiba. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.903, lon: -43.561
        },
        {
          name: "CAPS III Profeta Gentileza",
          type: "CAPS III — SUS · 24h",
          address: "Estrada de Inhoaíba, 849 — Inhoaíba",
          phone: "+552131557057",
          phoneDisplay: "(21) 3155-7057",
          hours: "24 horas",
          note: "Atende: Inhoaíba, Santa Margarida e parte de Campo Grande. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.91, lon: -43.595
        },
        {
          name: "CAPSi II João de Barro",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "Estrada do Campinho, s/nº — Santa Margarida, Campo Grande",
          phone: "+552133942668",
          phoneDisplay: "(21) 3394-2668",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Campo Grande, Santíssimo, Santa Margarida, Guaratiba e Inhoaíba. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.915, lon: -43.59
        },
        {
          name: "CAPS II Simão Bacamarte",
          type: "CAPS II — SUS",
          address: "Av. Senador Camará, 224 — Santa Cruz",
          phone: "+552133658775",
          phoneDisplay: "(21) 3365-8775",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Santa Cruz, Paciência e Sepetiba. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.919, lon: -43.684
        },
        {
          name: "CAPS AD II Júlio César de Carvalho",
          type: "CAPS AD — álcool e outras drogas (SUS)",
          address: "R. Severino das Chagas, 196 — Santa Cruz",
          phone: "+5521979699608",
          phoneDisplay: "(21) 97969-9608",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Santa Cruz, Paciência e Sepetiba. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['adultos'],
          categories: ['caps-ad'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.92, lon: -43.68
        },
        {
          name: "CAPSi II Mafalda",
          type: "CAPSi — infantojuvenil (SUS)",
          address: "R. Álvaro Alberto, 601 — Santa Cruz",
          hours: "Seg–Sex, 8h–17h",
          note: "Atende: Santa Cruz, Paciência e Sepetiba. Telefone não divulgado na lista oficial; use o 1746. Posição do pin aproximada pelo bairro. Fonte: Prefeitura do Rio (saude.prefeitura.rio/caps).",
          ageGroups: ['menores'],
          categories: ['caps'],
          website: "https://saude.prefeitura.rio/caps/",
          lat: -22.921, lon: -43.685
        },
        {
          name: "CVV — Centro de Valorização da Vida",
          type: "Apoio emocional virtual e telefônico (voluntariado, gratuito)",
          address: "Atendimento por telefone, chat e e-mail — sem endereço físico",
          phone: "+55188",
          phoneDisplay: "188",
          website: "https://cvv.org.br",
          hours: "24 horas",
          note: "Ligação gratuita e sigilosa, de todo o Brasil. Chat e e-mail em cvv.org.br.",
          ageGroups: ['adultos','menores'],
          categories: ['apoio-social','urgencia'],
          lat: -22.9068, lon: -43.1729
        }

      ];

      // ---- Campos derivados usados pelos filtros ----
      // formato: 'presencial' (padrão) | 'online' | 'hibrido'  — pagamento: 'gratuito' | 'social'
      const FORMAT_OVERRIDES = {
        'Mapa do Acolhimento': 'online',
        'Entrelaços — Ambulatório do Luto': 'hibrido',
        'CVV — Centro de Valorização da Vida': 'online'
      };
      clinics.forEach((c, i)=>{
        c.id = i;
        c.format = FORMAT_OVERRIDES[c.name] || 'presencial';
        c.payment = /SUS|pública|público|Coordenação|CAPS|virtual/i.test(c.type) ? 'gratuito' : 'social';
      });
      const FORMAT_LABEL = { presencial:'Presencial', online:'Online', hibrido:'Presencial ou online' };
      const PAY_LABEL = { gratuito:'Gratuito (rede pública)', social:'Gratuito ou valor social' };
      const TYPE_GROUPS = [
        { id:'basica',     label:'Atenção básica / Policlínica',           cats:['saude-geral'] },
        { id:'caps',       label:'CAPS',                                    cats:['caps'] },
        { id:'capsad',     label:'CAPS AD (álcool e outras drogas)',        cats:['caps-ad'] },
        { id:'psiq',       label:'Hospital psiquiátrico',                   cats:['psiquiatria'] },
        { id:'urgencia',   label:'UPA / Pronto atendimento',                cats:['urgencia'] },
        { id:'psicologia', label:'Serviço de psicologia (universitário/social)', cats:['psicologia'] },
        { id:'plantao',    label:'Plantão psicológico',                     cats:['plantao'] },
        { id:'psicanalise',label:'Psicanálise',                             cats:['psicanalise'] },
        { id:'apoio',      label:'Apoio social, luto e família / ONG',      cats:['apoio-social','apoio-familia','luto'] },
        { id:'coord',      label:'Coordenação da rede',                     cats:['coordenacao'] }
      ];

      // ---- Mapa: tenta "ao vivo" (Leaflet + OpenStreetMap, com zoom real e rotas) e,
      // se não houver internet ou o carregamento falhar, cai para a imagem offline embutida ----
      const mapImg = document.getElementById('map');
      const mapLiveEl = document.getElementById('mapLive');
      const markerLayer = document.getElementById('markerLayer');
      const mapBadge = document.getElementById('mapBadge');
      // metros por pixel (na resolução natural da imagem), usados só no modo offline
      const MPP_X = 7.564857465193333;
      const MPP_Y = 4.867506588065595;
      // Local principal: Estácio de Sá — Campus Centro I, Av. Presidente Vargas, 642 (Centro)
      const HOME_NAME = 'Estácio de Sá — Av. Presidente Vargas, 642';
      const HOME = [-22.901794, -43.181944];
      const CENTER = HOME;

      let mode = 'static'; // 'static' | 'live'
      let liveMap = null, liveTileLayer = null, liveClickMarker = null, liveRadiusCircle = null;
      const liveClinicMarkers = [];

      function directionsUrl(lat, lon){
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      }

      function setPinPos(el, xPx, yPx){
        el.style.left = (xPx / IMG_W * 100) + '%';
        el.style.top = (yPx / IMG_H * 100) + '%';
      }

      // ---- Modo estático (offline) ----
      const clinicNodes = clinics.map((c)=>{
        const p = lonLatToPx(c.lon, c.lat);
        const pin = document.createElement('div');
        pin.className = 'pin';
        pin.title = `${c.name} — ${c.address}`;
        setPinPos(pin, p.x, p.y);
        markerLayer.appendChild(pin);
        return { ...c, px: p.x, py: p.y, pinEl: pin };
      });

      const clickPin = document.createElement('div');
      clickPin.className = 'pin click';
      clickPin.style.display = 'none';
      markerLayer.appendChild(clickPin);

      const radiusEllipse = document.createElement('div');
      radiusEllipse.id = 'radiusEllipse';
      markerLayer.appendChild(radiusEllipse);

      // ---- Zoom e arraste no mapa offline: pinça, scroll do mouse e botões +/− ----
      const mapFrameEl = document.querySelector('.map-frame');
      const zoomLayer = document.getElementById('zoomLayer');
      const Z_MIN = 1, Z_MAX = 6;
      let zs = 1, ztx = 0, zty = 0, gestureMoved = false;

      function applyZoom(){
        const W = zoomLayer.offsetWidth, H = zoomLayer.offsetHeight;
        ztx = Math.min(0, Math.max(W * (1 - zs), ztx));
        zty = Math.min(0, Math.max(H * (1 - zs), zty));
        zoomLayer.style.transform = `translate(${ztx}px, ${zty}px) scale(${zs})`;
        zoomLayer.style.setProperty('--z', zs);
      }
      function zoomAt(cx, cy, factor){
        const ns = Math.min(Z_MAX, Math.max(Z_MIN, zs * factor));
        const k = ns / zs;
        ztx = cx - (cx - ztx) * k;
        zty = cy - (cy - zty) * k;
        zs = ns;
        applyZoom();
      }
      function frameRect(){ return mapFrameEl.getBoundingClientRect(); }

      // scroll do mouse
      mapFrameEl.addEventListener('wheel', (e)=>{
        if(mode !== 'static') return;
        e.preventDefault();
        const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
        const r = frameRect();
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-dy * 0.0015));
      }, { passive:false });

      // botões + e −
      function zoomButton(factor){
        const r = frameRect();
        zoomAt(r.width / 2, r.height / 2, factor);
      }
      document.getElementById('zoomInBtn').addEventListener('click', ()=> zoomButton(1.5));
      document.getElementById('zoomOutBtn').addEventListener('click', ()=> zoomButton(1 / 1.5));

      // dedos (pinça + arrastar) e mouse (arrastar)
      const ptrs = new Map();
      let lastDist = 0, lastMid = null, startPt = null;
      function pinchInfo(){
        const [a, b] = Array.from(ptrs.values());
        return {
          dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        };
      }
      mapFrameEl.addEventListener('pointerdown', (e)=>{
        if(mode !== 'static' || (e.target.closest && e.target.closest('.zoom-ctl'))) return;
        if(e.pointerType === 'mouse' && e.button !== 0) return;
        if(ptrs.size === 0) gestureMoved = false;
        ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY });
        startPt = { x:e.clientX, y:e.clientY };
        if(ptrs.size === 2){
          const info = pinchInfo();
          lastDist = info.dist; lastMid = info.mid;
          gestureMoved = true;
        }
      });
      window.addEventListener('pointermove', (e)=>{
        const p = ptrs.get(e.pointerId);
        if(!p) return;
        if(ptrs.size === 1){
          if(!gestureMoved && Math.hypot(e.clientX - startPt.x, e.clientY - startPt.y) < 6) return;
          gestureMoved = true;
          ztx += e.clientX - p.x;
          zty += e.clientY - p.y;
          p.x = e.clientX; p.y = e.clientY;
          applyZoom();
        } else if(ptrs.size === 2){
          p.x = e.clientX; p.y = e.clientY;
          const { dist, mid } = pinchInfo();
          const r = frameRect();
          zoomAt(mid.x - r.left, mid.y - r.top, dist / lastDist);
          ztx += mid.x - lastMid.x;
          zty += mid.y - lastMid.y;
          applyZoom();
          lastDist = dist; lastMid = mid;
        }
      });
      function endPointer(e){ ptrs.delete(e.pointerId); }
      window.addEventListener('pointerup', endPointer);
      window.addEventListener('pointercancel', endPointer);
      window.addEventListener('resize', applyZoom);

      function handlePointerStatic(clientX, clientY){
        if(gestureMoved) return; // foi arraste/pinça, não um toque
        const rect = mapImg.getBoundingClientRect();
        const relX = (clientX - rect.left) / rect.width * IMG_W;
        const relY = (clientY - rect.top) / rect.height * IMG_H;
        if(relX < 0 || relX > IMG_W || relY < 0 || relY > IMG_H) return;
        const { lat, lon } = pxToLonLat(relX, relY);
        lastClick = { lat, lon };
        render(lat, lon);
      }
      mapImg.addEventListener('click', (e)=> handlePointerStatic(e.clientX, e.clientY));
      mapImg.addEventListener('touchend', (e)=>{
        if(e.changedTouches && e.changedTouches[0]){
          e.preventDefault();
          handlePointerStatic(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      }, {passive:false});

      function renderStatic(lat, lon, withDist){
        const p = lonLatToPx(lon, lat);
        clickPin.style.display = 'block';
        setPinPos(clickPin, p.x, p.y);

        const ellW = (2 * currentRadius / MPP_X) / IMG_W * 100;
        const ellH = (2 * currentRadius / MPP_Y) / IMG_H * 100;
        radiusEllipse.style.display = 'block';
        radiusEllipse.style.width = ellW + '%';
        radiusEllipse.style.height = ellH + '%';
        setPinPos(radiusEllipse, p.x, p.y);

        withDist.forEach(c=>{
          c.pinEl.className = 'pin' + (c.dist <= currentRadius ? ' inrange' : '');
        });
      }

      // ---- Modo ao vivo (Leaflet + tiles do OpenStreetMap) ----
      function loadScript(src){
        return new Promise((resolve, reject)=>{
          const s = document.createElement('script');
          s.src = src;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      function pinDivIcon(cls){
        return L.divIcon({ className:'', html:`<div class="leaflet-pin ${cls}"></div>`, iconSize:[16,16], iconAnchor:[8,8] });
      }

      function initLiveMap(){
        liveMap = L.map('mapLive', {
          scrollWheelZoom: true,   // zoom com o scroll do mouse
          touchZoom: true,         // zoom com pinça (dedos)
          dragging: true,
          zoomControl: true,       // botões + e −
          minZoom: 3
        }).setView(CENTER, 16);
        liveTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        }).addTo(liveMap);

        clinics.forEach(c=>{
          const marker = L.marker([c.lat, c.lon], { icon: pinDivIcon('') }).addTo(liveMap);
          marker.bindPopup(
            `<b>${c.name}</b><br>${c.type}<br>${c.address}<br>` +
            `<a href="${directionsUrl(c.lat,c.lon)}" target="_blank" rel="noopener">📍 Como chegar</a>`
          );
          liveClinicMarkers.push({ ...c, marker });
        });

        liveMap.on('click', (e)=>{
          lastClick = { lat: e.latlng.lat, lon: e.latlng.lng };
          render(lastClick.lat, lastClick.lon);
        });

        return new Promise((resolve, reject)=>{
          let settled = false;
          liveTileLayer.on('load', ()=>{ if(!settled){ settled = true; resolve(); } });
          liveTileLayer.on('tileerror', ()=>{ if(!settled){ settled = true; reject(new Error('tile error')); } });
          setTimeout(()=>{ if(!settled){ settled = true; reject(new Error('timeout')); } }, 5000);
        });
      }

      function switchToLiveMode(){
        mode = 'live';
        mapImg.style.display = 'none';
        markerLayer.style.display = 'none';
        mapLiveEl.style.display = 'block';
        document.getElementById('zoomCtl').style.display = 'none';
        mapBadge.textContent = 'mapa ao vivo · zoom real';
        setTimeout(()=> liveMap && liveMap.invalidateSize(), 50);
      }

      function renderLive(lat, lon, withDist){
        if(liveClickMarker) liveMap.removeLayer(liveClickMarker);
        if(liveRadiusCircle) liveMap.removeLayer(liveRadiusCircle);
        liveClickMarker = L.marker([lat, lon], { icon: pinDivIcon('click') }).addTo(liveMap);
        liveRadiusCircle = L.circle([lat, lon], {
          radius: currentRadius, color:'#2f6fed', weight:1.5, dashArray:'4 3',
          fillColor:'#2f6fed', fillOpacity:0.12
        }).addTo(liveMap);

        withDist.forEach(c=>{
          const node = liveClinicMarkers.find(m=> m.name === c.name && m.lat === c.lat);
          if(node) node.marker.setIcon(pinDivIcon(c.dist <= currentRadius ? 'inrange' : ''));
        });
      }

      async function tryEnableLiveMap(){
        if(!navigator.onLine) return;
        try{
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js');
          if(typeof L === 'undefined') return;
          await initLiveMap();
          switchToLiveMode();
          if(lastClick) render(lastClick.lat, lastClick.lon);
        }catch(err){
          // permanece no modo offline (imagem já está pronta e funcional)
          if(liveMap){ liveMap.remove(); liveMap = null; }
        }
      }

      const hint = document.getElementById('hintBadge');
      const panelTitle = document.getElementById('panelTitle');
      const panelSub = document.getElementById('panelSub');
      const resultsList = document.getElementById('resultsList');
      const radiusInput = document.getElementById('radiusInput');
      const radiusValue = document.getElementById('radiusValue');
      const filterAdult = document.getElementById('filterAdult');
      const filterMinor = document.getElementById('filterMinor');
      const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
      const filtersPanel = document.getElementById('filtersPanel');
      const filtersChevron = document.getElementById('filtersChevron');
      const filtersBadge = document.getElementById('filtersBadge');
      const addressInput = document.getElementById('addressInput');
      const addressSearchBtn = document.getElementById('addressSearchBtn');
      const addressSearchMsg = document.getElementById('addressSearchMsg');
      const typeList = document.getElementById('typeList');
      const typeAll = document.getElementById('typeAll');
      const paymentSelect = document.getElementById('paymentSelect');
      const clearFiltersBtn = document.getElementById('clearFiltersBtn');
      const openListBtn = document.getElementById('openListBtn');
      const closeListBtn = document.getElementById('closeListBtn');
      const listClearBtn = document.getElementById('listClearBtn');
      const allListCard = document.getElementById('allListCard');
      const allListTitle = document.getElementById('allListTitle');
      const allListSub = document.getElementById('allListSub');
      const allList = document.getElementById('allList');
      document.getElementById('listCount').textContent = '(' + clinics.length + ')';

      let currentRadius = parseInt(radiusInput.value, 10);
      let lastClick = null;

      // checkboxes de "Tipo de atendimento"
      TYPE_GROUPS.forEach(g=>{
        const lab = document.createElement('label');
        lab.className = 'filter-check';
        lab.innerHTML = `<input type="checkbox" data-g="${g.id}" checked> ${g.label}`;
        typeList.appendChild(lab);
      });
      const typeBoxes = Array.from(typeList.querySelectorAll('input'));
      function syncTypeAll(){
        const n = typeBoxes.filter(b=>b.checked).length;
        typeAll.checked = n === typeBoxes.length;
        typeAll.indeterminate = n > 0 && n < typeBoxes.length;
      }
      typeBoxes.forEach(b=> b.addEventListener('change', ()=>{ syncTypeAll(); applyFilters(); }));
      typeAll.addEventListener('change', ()=>{
        typeBoxes.forEach(b=> b.checked = typeAll.checked);
        syncTypeAll();
        applyFilters();
      });

      function readFilters(){
        return {
          adult: filterAdult.checked,
          minor: filterMinor.checked,
          groups: new Set(typeBoxes.filter(b=>b.checked).map(b=>b.dataset.g)),
          format: document.querySelector('input[name="fmt"]:checked').value,
          payment: paymentSelect.value
        };
      }
      let applied = readFilters();

      function matchesFilters(c){
        const f = applied;
        if(!((f.adult && c.ageGroups.includes('adultos')) || (f.minor && c.ageGroups.includes('menores')))) return false;
        if(f.groups.size < TYPE_GROUPS.length){
          const cats = c.categories || [];
          if(!TYPE_GROUPS.some(g=> f.groups.has(g.id) && g.cats.some(x=> cats.includes(x)))) return false;
        }
        if(f.format === 'presencial' && c.format === 'online') return false;
        if(f.format === 'online' && c.format === 'presencial') return false;
        if(f.format === 'hibrido' && c.format !== 'hibrido') return false;
        if(f.payment !== 'todos' && c.payment !== f.payment) return false;
        return true;
      }

      function applyFilters(){
        applied = readFilters();
        clinicNodes.forEach(n=>{
          n.pinEl.style.display = matchesFilters(n) ? '' : 'none';
        });
        if(liveMap){
          liveClinicMarkers.forEach(n=>{
            const visible = matchesFilters(n);
            const onMap = liveMap.hasLayer(n.marker);
            if(visible && !onMap) n.marker.addTo(liveMap);
            if(!visible && onMap) liveMap.removeLayer(n.marker);
          });
        }
        updateFiltersBadge();
        if(lastClick) render(lastClick.lat, lastClick.lon);
        else if(allListCard.style.display !== 'none') renderAllList();
      }

      function updateFiltersBadge(){
        const f = applied;
        let active = 0;
        if(f.groups.size < TYPE_GROUPS.length) active++;
        if(!f.adult || !f.minor) active++;
        if(f.format !== 'todos') active++;
        if(f.payment !== 'todos') active++;
        if(active > 0){
          filtersBadge.textContent = active;
          filtersBadge.style.display = 'inline-block';
        } else {
          filtersBadge.style.display = 'none';
        }
      }

      function clearFilters(){
        typeBoxes.forEach(b=> b.checked = true);
        syncTypeAll();
        filterAdult.checked = true;
        filterMinor.checked = true;
        document.querySelector('input[name="fmt"][value="todos"]').checked = true;
        paymentSelect.value = 'todos';
        applyFilters();
      }

      // filtros aplicados automaticamente a cada mudança (o painel continua aberto)
      [filterAdult, filterMinor, paymentSelect].forEach(el=> el.addEventListener('change', applyFilters));
      document.querySelectorAll('input[name="fmt"]').forEach(el=> el.addEventListener('change', applyFilters));
      clearFiltersBtn.addEventListener('click', clearFilters);
      listClearBtn.addEventListener('click', clearFilters);

      // ---- Item de unidade (usado nos resultados e na lista completa) ----
      function fmtDist(d){ return d < 1000 ? `${Math.round(d)} m` : `${(d/1000).toFixed(1)} km`; }
      function clinicItemInner(c, dist, inrange){
        return `
          <div class="clinic-top">
            <span class="clinic-name">${c.name}</span>
            <span class="clinic-dist ${inrange?'inrange':''}">${fmtDist(dist)}</span>
          </div>
          <div class="clinic-meta">${c.type} · ${c.address}</div>
          <div class="clinic-meta">${FORMAT_LABEL[c.format]} · ${PAY_LABEL[c.payment]}</div>
          ${c.hours ? `<div class="clinic-meta">${c.hours}</div>` : ''}
          ${c.note ? `<div class="clinic-note">${c.note}</div>` : ''}
          <div class="clinic-actions">
            ${c.phone ? `<a href="tel:${c.phone}">📞 Ligar ${c.phone2 ? c.phoneDisplay.split(' / ')[0] : c.phoneDisplay}</a>` : ''}
            ${c.phone2 ? `<a href="tel:${c.phone2}">📞 Ou ${c.phoneDisplay.split(' / ').pop()}</a>` : ''}
            ${c.website ? `<a href="${c.website}" target="_blank" rel="noopener">🌐 Site</a>` : ''}
            <a href="${directionsUrl(c.lat, c.lon)}" target="_blank" rel="noopener">📍 Como chegar</a>
            <a href="#" data-focus="${c.id}">🗺️ Ver no mapa</a>
          </div>
        `;
      }

      function focusClinic(id){
        const c = clinics[id];
        if(!c) return;
        document.querySelector('.map-frame').scrollIntoView({ behavior:'smooth', block:'center' });
        if(mode === 'live' && liveMap){
          liveMap.setView([c.lat, c.lon], 17);
          const node = liveClinicMarkers.find(m=> m.id === id);
          if(node){
            if(!liveMap.hasLayer(node.marker)) node.marker.addTo(liveMap);
            node.marker.openPopup();
          }
        }
      }
      document.addEventListener('click', (e)=>{
        const a = e.target.closest && e.target.closest('[data-focus]');
        if(!a) return;
        e.preventDefault();
        focusClinic(parseInt(a.getAttribute('data-focus'), 10));
      });

      // ---- Lista de unidades do site ----
      function renderAllList(){
        const from = lastClick || { lat: HOME[0], lon: HOME[1], home: true };
        const total = clinics.length;
        const list = clinics.filter(matchesFilters)
          .map(c=>({ ...c, dist: haversine(from.lat, from.lon, c.lat, c.lon) }))
          .sort((a,b)=> a.dist - b.dist);
        const filtered = list.length < total;
        allListTitle.textContent = filtered
          ? `${list.length} de ${total} unidades (filtros ativos)`
          : `${total} unidades cadastradas`;
        allListSub.textContent = 'Ordenadas pela distância a partir de: ' + (from.home ? HOME_NAME : 'ponto escolhido no mapa');
        listClearBtn.style.display = filtered ? 'inline-block' : 'none';
        allList.innerHTML = '';
        if(!list.length){
          allList.innerHTML = '<div class="empty-state">Nenhuma unidade com esses filtros.</div>';
          return;
        }
        list.forEach(c=>{
          const item = document.createElement('div');
          item.className = 'clinic-item';
          item.innerHTML = clinicItemInner(c, c.dist, false);
          allList.appendChild(item);
        });
      }
      openListBtn.addEventListener('click', ()=>{
        const open = allListCard.style.display !== 'none';
        if(open){
          allListCard.style.display = 'none';
        } else {
          renderAllList();
          allListCard.style.display = 'block';
          allListCard.scrollIntoView({ behavior:'smooth', block:'start' });
        }
      });
      closeListBtn.addEventListener('click', ()=>{ allListCard.style.display = 'none'; });

      toggleFiltersBtn.addEventListener('click', ()=>{
        const isOpen = filtersPanel.style.display !== 'none';
        filtersPanel.style.display = isOpen ? 'none' : 'block';
        filtersChevron.classList.toggle('open', !isOpen);
      });

      // botão no fim do painel: recolhe (somente quando a pessoa tocar nele)
      document.getElementById('collapseFiltersBtn').addEventListener('click', ()=>{
        filtersPanel.style.display = 'none';
        filtersChevron.classList.remove('open');
        toggleFiltersBtn.scrollIntoView({ behavior:'smooth', block:'start' });
      });

      async function searchAddress(){
        const q = addressInput.value.trim();
        if(!q){
          addressSearchMsg.textContent = 'Digite um endereço, rua ou bairro.';
          addressSearchMsg.className = 'search-msg error';
          return;
        }
        addressSearchMsg.textContent = 'Buscando…';
        addressSearchMsg.className = 'search-msg';
        addressSearchBtn.disabled = true;
        try{
          const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q='
            + encodeURIComponent(q + ', Rio de Janeiro, Brasil');
          const resp = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
          if(!resp.ok) throw new Error('network');
          const data = await resp.json();
          if(!data || !data.length){
            addressSearchMsg.textContent = 'Endereço não encontrado. Tente incluir rua e bairro.';
            addressSearchMsg.className = 'search-msg error';
            return;
          }
          const lat = parseFloat(data[0].lat), lon = parseFloat(data[0].lon);
          lastClick = { lat, lon };
          render(lat, lon);
          if(mode === 'live' && liveMap){
            liveMap.setView([lat, lon], 16);
          }
          addressSearchMsg.textContent = 'Mostrando unidades perto de: ' + data[0].display_name;
          addressSearchMsg.className = 'search-msg ok';
        }catch(err){
          addressSearchMsg.textContent = 'Não consegui buscar agora — precisa de internet para localizar o endereço. Você ainda pode tocar direto no mapa.';
          addressSearchMsg.className = 'search-msg error';
        }finally{
          addressSearchBtn.disabled = false;
        }
      }
      addressSearchBtn.addEventListener('click', searchAddress);
      addressInput.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){ e.preventDefault(); searchAddress(); }
      });

      radiusInput.addEventListener('input', ()=>{
        currentRadius = parseInt(radiusInput.value, 10);
        radiusValue.textContent = currentRadius;
        if(lastClick) render(lastClick.lat, lastClick.lon);
      });

      function render(lat, lon){
        hint.style.opacity = '0';

        const withDist = clinics.filter(matchesFilters).map(c=>({
          ...c,
          dist: haversine(lat, lon, c.lat, c.lon)
        })).sort((a,b)=> a.dist - b.dist);

        // sincroniza withDist com os nós usados no modo estático (mesma ordem/objeto)
        const withDistStatic = withDist.map(c=>{
          const node = clinicNodes.find(n=> n.name === c.name && n.lat === c.lat);
          return { ...node, dist: c.dist };
        });

        if(mode === 'live'){
          renderLive(lat, lon, withDist);
        } else {
          renderStatic(lat, lon, withDistStatic);
        }

        const inRange = withDist.filter(c=> c.dist <= currentRadius);
        const nearest = withDist.slice(0, 3);

        panelTitle.textContent = inRange.length
          ? `${inRange.length} unidade${inRange.length>1?'s':''} dentro de ${currentRadius} m`
          : `Nenhuma unidade dentro de ${currentRadius} m`;
        const fromHome = !!(lastClick && lastClick.home);
        const homePrefix = fromHome ? `A partir da ${HOME_NAME}. Toque em outro ponto do mapa para mudar. ` : '';
        panelSub.textContent = homePrefix + (inRange.length
          ? "Toque em \"Ligar\" para confirmar disponibilidade antes de ir."
          : "Mostrando as unidades mais próximas do ponto — tente aumentar o raio ou tocar mais perto de um marcador verde.");

        const listToShow = inRange.length ? inRange : nearest;
        resultsList.innerHTML = '';
        listToShow.forEach(c=>{
          const item = document.createElement('div');
          item.className = 'clinic-item';
          item.innerHTML = clinicItemInner(c, c.dist, c.dist <= currentRadius);
          resultsList.appendChild(item);
        });
        if(allListCard.style.display !== 'none') renderAllList();
      }

      // tenta atualizar para o mapa ao vivo (zoom real + rotas); se falhar, o modo offline já está pronto
      // aplica o estado inicial dos filtros (por padrão, mostra tudo) e tenta o mapa ao vivo
      // ponto inicial = Estácio de Sá (Presidente Vargas)
      lastClick = { lat: HOME[0], lon: HOME[1], home: true };
      applyFilters();
      tryEnableLiveMap();
    })();
