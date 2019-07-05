import * as React from 'react';
import CardDrawImage from './CardDrawImage';
import './CardDraw.scss';

interface IState {
  selectedCards: [];
  selectedCardsUris: [];
  numMulls: number;
}

interface IProps {
  deck: Object[];
  londonMulligan: boolean;
}

interface ISelectedCard {
  id: string;
  toBottom: boolean;
}

class Drawer extends React.Component<IProps, {}> {
  public drawSize: number = 7;
  public readonly state: Readonly<IState> = {
    selectedCards: [],
    selectedCardsUris: [],
    numMulls: 0,
  };

  private static defaultProps = {
    deck: [{}],
    londonMulligan: true,
  };

  public componentDidMount() {
    this.drawCards();
  }

  public shuffle = (array: ISelectedCard[]) => {
    let currentIndex: number = array.length;
    let temporaryValue: ISelectedCard = null;
    let randomIndex: number = 0;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  public drawCards = async (mulligans: number = 0) => {
    let drawedCards: ISelectedCard[] = [];
    const cardsToDraw = this.drawSize - mulligans;
    const flattenedDeck: ISelectedCard[] = [];
    await this.props.deck.map((card: any) => {
      for (let i = 0; i <= card.amount - 1; i += 1) {
        flattenedDeck.push({ id: card.id, toBottom: false });
      }
    });

    if (this.props.londonMulligan) {
      // London Mulligan
      drawedCards = await this.shuffle(flattenedDeck).slice(0, 7);
    }

    if (!this.props.londonMulligan) {
      // Vancouver Mulligan (not done in render yet)
      drawedCards = await this.shuffle(flattenedDeck).slice(0, cardsToDraw);
    }

    await this.setState({ selectedCards: drawedCards });
    this.getCardImages(this.state.selectedCards);
  };

  public getCardImages = async (cardIds: ISelectedCard[]): Promise<void> => {
    this.setState({ selectedCardsUris: [] });

    await cardIds.reduce((cards, card) => {
      return cards.then(() => {
        return new Promise((resolve: any) => {
          setTimeout(() => {
            resolve(
              fetch(`https://api.scryfall.com/cards/${card.id}`)
                .then((response: Response) => response.json())
                .then((response): any =>
                  this.setState({ selectedCardsUris: [...this.state.selectedCardsUris, response.image_uris.normal] }),
                ),
            );
          }, 200);
        });
      });
    }, Promise.resolve());
  };

  public takeMulligan = async () => {
    await this.setState({ numMulls: this.state.numMulls + 1 });
    this.drawCards(this.state.numMulls);
  };

  public loader = () => (
    <div className="loader">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  public handleLoading = (): boolean => {
    if (this.props.londonMulligan) {
      if (this.state.selectedCardsUris.length >= 7) {
        return true;
      }
    } else {
      if (this.state.selectedCardsUris.length === this.drawSize - this.state.numMulls) {
        return true;
      }
    }
    return false;
  };

  public drawNewHand = () => {
    this.setState({ numMulls: 0 });
    this.drawCards(0);
  };

  public render() {
    return (
      <div>
        <div className="drawer-card-wrapper">
          {this.props.londonMulligan
            ? this.state.selectedCardsUris.length >= 7
              ? this.state.selectedCardsUris.map((uri: string) => <CardDrawImage key={Math.random()} uri={uri} />)
              : this.loader()
            : this.state.selectedCardsUris.length === this.drawSize - this.state.numMulls
            ? this.state.selectedCardsUris.map((uri: string) => <CardDrawImage key={Math.random()} uri={uri} />)
            : this.loader()}
        </div>
        <React.Fragment>
          {this.handleLoading() && (
            <div className="drawer-mull-wrapper">
              <span>Remove {this.state.numMulls}</span>
              <button onClick={() => this.takeMulligan()}>Mull to {this.drawSize - this.state.numMulls - 1}</button>
              <button onClick={() => this.drawNewHand()}>New hand</button>
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

export default Drawer;
