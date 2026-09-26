# Execução dos testes E2E

Rodar em `backend` com PostgreSQL acessível e as variáveis de teste configuradas:

```powershell
pnpm test:e2e
```

A suíte continua usando as migrations reais, a aplicação Nest, autenticação,
PostgreSQL e Cloudinary nos testes de imagens. As verificações existentes não
foram removidas nem substituídas por mocks.

## Preparação e isolamento

- Por padrão, dois workers executam arquivos em paralelo, em processos isolados.
- O setup global cria um schema exclusivo para cada worker e aplica as migrations
  uma vez por schema. O Prisma CLI instalado é executado diretamente pelo Node,
  sem inicializar `npx` para cada arquivo.
- Cada arquivo recebe o schema de seu worker antes de importar a aplicação. Todas
  as tabelas de dados são limpas antes dos hooks do arquivo; a tabela de migrations
  é preservada. Isso inclui sessões, tabelas de relacionamento e sequências.
- Os schemas são removidos no encerramento da execução. Cada execução tem um
  identificador aleatório; execuções simultâneas não compartilham schemas.
- Os testes de imagens usam slugs únicos para evitar que uploads ou exclusões de
  uma loja interfiram em outro teste no Cloudinary.

O isolamento continua ativo (`isolate: true`). Não compartilhar uma aplicação Nest
ou um schema entre workers: isso mistura dados, sessões e estado dos guards.
Testes concorrentes dentro de um mesmo arquivo devem preparar seus próprios dados.

## Ajustar concorrência e medir

```powershell
# Um worker: útil para comparar e validar a limpeza entre arquivos.
pnpm exec vitest run --config vitest.config.e2e.ts --mode test --maxWorkers=1

# Experimentar quatro workers se a máquina e o banco suportarem.
pnpm exec vitest run --config vitest.config.e2e.ts --mode test --maxWorkers=4

# Mostrar tempo de limpeza do banco por arquivo e resultados individuais.
$env:E2E_PROFILE = '1'
pnpm exec vitest run --config vitest.config.e2e.ts --mode test --reporter=verbose
Remove-Item Env:E2E_PROFILE
```

O tempo de preparação dos schemas aparece como `[E2E database]`. Aumentar workers
também aumenta conexões, processos e chamadas externas; mais workers não garantem
uma execução mais rápida. Comparar os mesmos arquivos, na mesma máquina, sem
outras suítes concorrentes.

No modo watch, os schemas são reutilizados e os dados são limpos a cada arquivo
reexecutado. Reiniciar o watch depois de adicionar ou alterar migrations.

Os arquivos `test/e2e/isolation-*.e2e.spec.ts` verificam dados inicialmente vazios,
o schema efetivo da conexão, histórico de migrations e constraints reais. Usam
as mesmas chaves de propósito para detectar contaminação entre arquivos.

## Medições desta alteração

Na mesma máquina, o recorte de autenticação, refresh e categorias (6 testes em
3 arquivos) passou de **77,59 s** com a configuração anterior para **43,26 s**
com a nova configuração, aproximadamente 44% menos tempo.

A suíte completa otimizada passou com **60 testes em 57 arquivos, em 180,95 s**,
incluindo os dois novos testes de isolamento e uploads reais. Os dois testes de
isolamento também passaram com um único worker, validando a reutilização do mesmo
schema entre arquivos.

Havia uma expectativa antiga no E2E de `/stores` que exigia `status` na resposta
pública. Ela foi alinhada à SEG-05: agora confere exatamente os seis campos públicos
permitidos, rejeitando também campos extras. Nenhuma regra da aplicação foi alterada.

Tempos variam com hardware, carga do PostgreSQL e rede. Falhas de acesso ao
Cloudinary continuam sendo falhas da suíte; não são ignoradas para melhorar o resultado.
