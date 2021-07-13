"use strict";
//faz o calculo das saidas do programa utilizando os dados digitados nos inputs anteriores
function calcular() {
    var montante = document.getElementById("montante");
    var taxaAnual = document.getElementById("taxaAnual");
    var anos = document.getElementById("anos");
    var cep = document.getElementById("cep");
    var pagamentoMensal = document.getElementById("pagamentoMensal");
    var pagamentoTotal = document.getElementById("pagamentoTotal");
    var jurosTotais = document.getElementById("jurosTotais");

    var principal = parseFloat(montante.value);
    var juros = parseFloat(taxaAnual.value) / 100 / 12;
    var pagamentos = parseFloat(anos.value) * 12;

    var x = Math.pow(1 + juros, pagamentos);
    var mensalidade = (principal * x * juros) / (x - 1);
    if (isFinite(mensalidade)) {
        pagamentoMensal.innerHTML = mensalidade.toFixed(2);
        pagamentoTotal.innerHTML = (mensalidade * pagamentos).toFixed(2);
        jurosTotais.innerHTML = ((mensalidade * pagamentos) - principal).toFixed(2);
        save(montante.value, taxaAnual.value, anos.value, cep.value);
        chart(principal, juros, mensalidade, pagamentos);
    } else {
        pagamentoMensal.innerHTML = "";
        pagamentoTotal.innerHTML = "";
        jurosTotais.innerHTML = "";
        chart();
    }

}
// caso haja compatibilidade, salva os dados digitados em armazenamento local
function save(montante, taxaAnual, anos, cep) {
    if (window.localStorage) {
        localStorage.emprestimo_montante = montante;
        localStorage.emprestimo_taxaAnual = taxaAnual;
        localStorage.emprestimo_anos = anos;
        localStorage.emprestimo_cep = cep;



    }

}
//faz o carregamento dos dados salvos. caso haja compatibilidade com armazenamento local
window.onload = function() {
    if (window.localStorage && localStorage.emprestimo_montante) {
        document.getElementById("montante").value = localStorage.emprestimo_montante;
        document.getElementById("taxaAnual").value = localStorage.emprestimo_taxaAnual;
        document.getElementById("anos").value = localStorage.emprestimo_anos;
        document.getElementById("cep").value = localStorage.emprestimo_cep;
    }
};
//faz o grafico do saldo devedor mensal, dos juros e do capital, se não houver argumentos apaga o gráfico
function chart(principal, juros, mensalidade, pagamentos) {
    //window.alert(String(principal) + "\n" + String(juros) + "\n" + String(mensalidade) + "\n" + String(pagamentos) + "\t");
    var graph = document.getElementById("graph");
    graph.width = graph.width;
    if (arguments.length == 0 || !graph.getContext) return;
    var g = graph.getContext("2d");
    var width = graph.width;
    var height = graph.height;

    //Convertendo valores monetarios e numeros de pagamento em pixels para mostrar no gráfico
    function paymentToX(n) {
        return n * width / pagamentos;
    }

    function montanteToY(a) {
        return height - ((a * height) / (mensalidade * pagamentos * 1.05));
    }
    //os pagamentos formam uma linha reta do ponto (0,0) até (pagamentos,mensalidade*pagamentos)
    g.moveTo(paymentToX(0), montanteToY(0));
    g.lineTo(paymentToX(pagamentos), montanteToY(mensalidade * pagamentos));
    g.lineTo(paymentToX(pagamentos), montanteToY(0));
    g.closePath();
    g.fillStyle = "#f88";
    g.fill();
    g.font = "bold 12px sans-serif";
    g.fillText("Pagamento de juros totais", 20, 20);
    var equity = 0;
    g.beginPath();
    g.moveTo(paymentToX(0), montanteToY(0));
    for (let index = 1; index < pagamentos; index++) {
        var juroMensal = (principal - equity) * juros
        equity += (mensalidade - juroMensal);
        g.lineTo(paymentToX(index), montanteToY(equity));

    }
    g.lineTo(paymentToX(pagamentos), montanteToY(0));
    g.closePath();
    g.fillStyle = "green";
    g.fill();
    g.fillText("Patrimônio Líquido Cumulativo total", 20, 35);
    var bal = principal;
    g.beginPath();
    g.moveTo(paymentToX(0), montanteToY(bal));
    for (let index = 1; index < pagamentos; index++) {
        var juroMensal = bal * juros
        bal -= (mensalidade - juroMensal);
        g.lineTo(paymentToX(index), montanteToY(bal));

    }
    //cria uma linha no gráfico canvas que representa o equity do empréstimo
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = "black";
    g.fillText("Balanço do empréstimo", 20, 50);
    g.textAlign = "center";
    var y = montanteToY(0);
    for (var ano = 1; ano * 12 <= pagamentos; ano++) {
        var x = paymentToX(ano * 12);
        g.fillRect(x - 0.5, y - 3, 1, 3);
        if (ano == 1) g.fillText("Ano", x, y - 5);
        if (ano % 2 == 0 && ano * 12 != pagamentos) g.fillText(String(ano), x, y - 5);
    }
    g.textAlign = "right";
    g.textBaseLine = "middle";
    var ticks = [pagamentos * juroMensal, principal];
    var r_edge = paymentToX(pagamentos);
    for (let index = 0; index < ticks.length; index++) {
        var y = montanteToY(String(ticks[index].toFixed(0)), r_edge - 5, y);

    }
}
