// Black Jack Game
import "./style.css";
import { Card, DrawResponse } from "./cards";

// DOM-element
const playerHandEl = document.getElementById("player-hand") as HTMLElement;
const dealerHandEl = document.getElementById("dealer-hand") as HTMLElement;
const playerScoreEl = document.getElementById("player-score") as HTMLElement;
const dealerScoreEl = document.getElementById("dealer-score") as HTMLElement;
const resultMessageEl = document.getElementById(
  "result-message",
) as HTMLElement;
const hitButton = document.getElementById("hit-button") as HTMLButtonElement;
const standButton = document.getElementById(
  "stand-button",
) as HTMLButtonElement;
let resetButton: HTMLButtonElement;

// BlackJack-klassen
class BlackJack {
  private deckId: string;
  private playerCards: Card[] = [];
  private dealerCards: Card[] = [];

  constructor(deckId: string) {
    this.deckId = deckId;
  }

  // Starta spelet
  async start() {
    await this.createDeck();
    await this.initialDraw();
    this.updateView();
    this.enableButtons();
  }

  // Skapa och blanda en ny kortlek
  private async createDeck() {
    const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/");
    const data = await response.json();
    this.deckId = data.deck_id;
  }

  // Dra initiala kort
  private async initialDraw() {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=4`);
    const data: DrawResponse = await response.json();
    this.playerCards.push(data.cards[0], data.cards[1]);
    this.dealerCards.push(data.cards[2], data.cards[3]);
  }

  // Dra ett kort från leken
  private async drawCard(): Promise<Card> {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`);
    const data: DrawResponse = await response.json();
    return data.cards[0];
  }

  // Uppdatera sidan
  private updateView(showDealer: boolean = false) {
    playerHandEl.innerHTML = this.playerCards
      .map((card) => `<img src="${card.image}" alt="${card.value} of ${card.suit}" />`)
      .join("");
    dealerHandEl.innerHTML = this.dealerCards
      .map((card, index) =>
        index === 0 || showDealer
          ? `<img src="${card.image}" alt="${card.value} of ${card.suit}" />`
          : `<div class="card-back"></div>`,
      )
      .join("");

    playerScoreEl.textContent = this.getHandValue(this.playerCards).toString();
    dealerScoreEl.textContent = showDealer
      ? this.getHandValue(this.dealerCards).toString()
      : "?";
  }

  // Räkna ut värdet på en hand
  private getHandValue(cards: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (["KING", "QUEEN", "JACK"].includes(card.value)) {
        value += 10;
      } else if (card.value === "ACE") {
        value += 11;
        aces++;
      } else {
        value += parseInt(card.value, 10);
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  // Spelarens tur
  async playerTurn() {
    const card = await this.drawCard();
    this.playerCards.push(card);
    this.updateView();

    if (this.getHandValue(this.playerCards) > 21) {
      resultMessageEl.textContent = "Du bustade! Dealern vinner!";
      this.endGame();
    }
  }

  // Dealerns tur
  async dealerTurn() {
    while (this.getHandValue(this.dealerCards) < 17) {
      const card = await this.drawCard();
      this.dealerCards.push(card);
    }
    this.updateView(true);
    this.showResult();
  }

  // Visa resultat
  private showResult() {
    const playerValue = this.getHandValue(this.playerCards);
    const dealerValue = this.getHandValue(this.dealerCards);

    if (playerValue > 21) {
      resultMessageEl.textContent = "Du bustade, dealern vinner!";
    } else if (dealerValue > 21) {
      resultMessageEl.textContent = "Dealern bustade, du vinner!";
    } else if (playerValue > dealerValue) {
      resultMessageEl.textContent = "Du vinner!";
    } else if (playerValue < dealerValue) {
      resultMessageEl.textContent = "Dealern vinner!";
    } else {
      resultMessageEl.textContent = "Det blev oavgjort!";
    }

    this.endGame();
  }

  // Avsluta spelet och visa reset-knappen
  private endGame() {
    hitButton.disabled = true;
    standButton.disabled = true;

    // Skapa reset-knappen om den inte redan finns
    if (!resetButton) {
      resetButton = document.createElement("button");
      resetButton.textContent = "Reset";
      resetButton.className = "reset";
      resetButton.addEventListener("click", () => this.resetGame());
      document.querySelector(".buttons")?.appendChild(resetButton);
    }
    resetButton.style.display = "inline-block";
  }

  // Återställ spelet
  private async resetGame() {
    this.playerCards = [];
    this.dealerCards = [];
    resultMessageEl.textContent = "Välkommen till BlackJack!";
    playerHandEl.innerHTML = "";
    dealerHandEl.innerHTML = "";
    playerScoreEl.textContent = "0";
    dealerScoreEl.textContent = "?";
    resetButton.style.display = "none";

    // Starta om spelet
    await this.start();
  }

  private enableButtons() {
    hitButton.disabled = false;
    standButton.disabled = false;
  }
}

// Starta spelet
const game = new BlackJack("");
hitButton.addEventListener("click", async () => {
  await game.playerTurn();
});

standButton.addEventListener("click", async () => {
  await game.dealerTurn();
});


game.start();