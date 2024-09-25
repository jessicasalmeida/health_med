# Ambiente

## Preparando o ambiente

### Opção - Executando em ambiente Kubernets
- Passo 1: Executar o comando: minikube start
- Passo 2: Executar o comando: kubectl apply -f configmap.yaml
- Passo 3: Executar o comando: kubectl apply -f pv.yaml
- Passo 5: Executar o comando: kubectl apply -f pvc.yaml
- Passo 6: Executar o comando: kubectl apply -f depl-restaurante-db.yaml
- Passo 7: Executar o comando: kubectl apply -f depl-restaurante-api.yaml
- Passo 8: Executar o comando: kubectl apply -f metrics.yaml
- Passo 9: Executar o comando: kubectl port-forward service/restaurante-api 8000:8000

### Opção - Executando em ambiente docker
- Passo 1: Build da Imagem da Aplicação: docker build -t jessicasalmeida/restaurante:{version} .
- Passo 2: Run Banco de Dados + Imagem Aplicação: docker-compose -f docker-compose.yml up -d
- Passo 3: Collection disponivel na raiz da pasta do projeto "fiap_restaurante.postman_collection.json"
> Aplicação disponivel na porta 5000, mongo-express 8081 e mongo 27017

### Opção - Executando em ambiente local
- Passo 1: Instalação dependencias: npm install
- Passo 2: Build da Aplicação: npm run build
- Passo 3: Altere o arquivo .env a variavel DB_CONN_STRING para "mongodb://root:MongoDB2019!@localhost:27017/"
- Passo 4: Suba o ambiente do docker compose para o banco de dados
- Passo 5: NPM RUN DEV

# Testando a aplicação
## Collection

- File: fiap_restaurante.postman_collection.json
   - Collection Postman fiap_restaurante, esta divida em user, products, cart e order.
   > Na collection fiap_restaurante do postman existe uma variavel configurada para a porta 5000 para ambiente docker e 8000 para local (não esqueça de salvar ao editar ;D)

## Swagger
- Link: /api-docs/
- Atualizar Swagger: cmd ts-node src/swagger.ts


# Dados das APIs

## Gestão de Products

- getAllProducts: 
   - Endpoint: /product
   - ***TIP: para agilidades nos testes do professor este método carrega os produtos no banco de dados***

- createProduct: 
   - Endpoint: /product/
    > Exemplo:
    {
        "name": "Sorvete Misto",
        "options": [],
        "category": "sobremesa",
        "price": 10,
        "timeToPrepare": 2,
        "status": true
    }
    - ***TIP: salve o ID caso queira usar posteriormente***

- getProductById: 
   - Endpoint: /product/:id
   > Exemplo: product/65aeffe53cb25a62bcec76f7

- updateProductById: 
   - Endpoint: /product/:id
   > Exemplo: product/65aeffe53cb25a62bcec76f7
    {
        "name": "Sorvete Misto G",
        "options": [],
        "category": "sobremesa",
        "price": 10,
        "timeToPrepare": 2,
        "status": true
    }
- deleteProductById: 
   - Endpoint: /product/:id
   - Politica: Um produto só pode ser excluido/desativado se não estiver em nenhuma order ativa.
   - Para testar que está em uma order ativa adicione o produto no carrinho e o avance com a API receiveOrder,
neste momento o pedido esta ativo e o produto não poderá ser excluido
   > Exemplo: product/65aeffe53cb25a62bcec76f7

- deactivateProductById: 
   - Endpoint: /product/deactive/:id
  - Politica: Um produto só pode ser excluido/desativado se não estiver em nenhuma order ativa
   > Exemplo: product/65aeffe53cb25a62bcec76f7


- getProductByCategory: 
   - Endpoint: /product/categoria/:categoria
   > Exemplo: product/categoria/combo || product/categoria/lanche || product/categoria/bebida || product/categoria/sobremesa || product/categoria/acompanhamento
   - ***TIP: EndPoint criado para facilitar a consulta da categoria de products para montagem do cart***


## Gestão de Users

- createUser: 
   - Endpoint: /users
   - ***TIP: Copie o ID do createUser para usar nos próximos passos***
   >Exemplo:
    {
        "cpf": "000.000.000-00",
        "name": "Professor",
        "email": "professor@fiap.com"
    }



- getUserById: 
   - Endpoint: /users/:id
   > Exemplo:
    users/65ad86e5c8f936abc7bb2fb3



## Gestão de Cart
- createCart: 
   - Endpoint: /cart/
   - ***TIP: Copie o ID do cart para usar nos próximos passos***

- addUser: 
   - Endpoint: /cart/user/:id
   > Exemplo: /cart/user/65b19e8f5fe107d74bd05ce0?user=65ad86e5c8f936abc7bb2fb3

- addProduct: 
   - Endpoint: /cart/product/:id
   - Policies: Ao adicionar 1 compo e posteriomente adicionar 1 bebida e 1 acompanhamento, este itens terão seu valor zerado no cart, pois são inclusos no combo
   > Exemplo: /cart/product/65b19e8f5fe107d74bd05ce0?product=65b1a124e453756a9567b9c7
   - ***TIP: Ao adicionar use getProductByCategory para verificar quais os produtos da categoria pretendida***

- personalizeItens: 
   - Endpoint: /cart/itens/:id
   > Exemplo: /cart/itens/65b19e8f5fe107d74bd05ce0?product=65b1a124e453756a9567b9c7&options=["Pão com Gergelim","Hamburguer","Queijo Cheddar","Ketchup","Mostarda","Cebola","Picles"]

- resumeCart: 
   - Endpoint: /cart/:id
    > Exemplo: /cart/65b19e8f5fe107d74bd05ce0

- closeCart: 
   - Endpoint: /cart/close/:id
    > Exemplo: /cart/close/65b19e8f5fe107d74bd05ce0

- payCart: 
   - Endpoint: /cart/pay/:id
   > Exemplo: /cart/pay/65b19e8f5fe107d74bd05ce0

- sendToKitchen: 
   - Endpoint: /cart/kitchen/:id
   > Exemplo: /cart/kitchen/65b19e8f5fe107d74bd05ce0

- cancelCart: 
   - Endpoint: /cart/cancel/:id
   > Exemplo: /cart/cancel/65b19e8f5fe107d74bd05ce0



## Gestão de ORDER

- receiveOrder: 
   - Endpoint: /order/receive/:id
   >Exemplo: /order/receive/65b19e8f5fe107d74bd05ce0
   - ***TIP: Agora você esta manipulando a order. Copie e cole o id da order para sequencia das proximas***

- prepareOrder: 
   - Endpoint: /order/prepare/:id
  > Exemplo: /order/prepare/65b1a8b7f56e976b1536bf52

- estimateDelivery: 
   - Endpoint: /order/estimate/:id
   > Exemplo: /order/prepare/65b1a8b7f56e976b1536bf52
   - Policies: Nesta etapa é validada a fila de pedidos ativos, diferente de closed e ready e somada as estimativas de preparo de todos os pedidos anteriores ao atual)

- updateStatusToReady: 
   - Endpoint: /order/update/ready/:id
   > Exemplo: /order/prepare/65b1a8b7f56e976b1536bf52

- updateStatusToDelivered: 
   - Endpoint: /order/update/delivered/:id
   > Exemplo: /order/update/delivered/65b1a8b7f56e976b1536bf52

- updateStatusToClosed: 
   - Endpoint: /order/update/closed/:id
  > Exemplo: /order/update/closed/65b1a8b7f56e976b1536bf52

- getAllActiveOrders: 
   - Endpoint: /order/

