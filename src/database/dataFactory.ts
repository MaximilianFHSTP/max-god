import {Connection} from "./connection";
import * as contentTypes from '../config/contentTypes';
import * as contentLanguages from '../config/contentLanguages';
import * as storytTellers from '../config/contentStoryTellers';
import * as locationTypes from '../config/locationTypes';

export class DataFactory {
    private static _instance: DataFactory;
    private _connection: Connection;

    public static getInstance(): DataFactory {
        if (DataFactory._instance === null || DataFactory._instance === undefined) {
            DataFactory._instance = new DataFactory();
        }

        return DataFactory._instance;
    }

    public async createData() {
        this.initSettings();
        // order is important don't change!
        await this.createLocationTypes();
        await this.createStatusTypes();
        await this.createRoomLocations();
        await this.createDoorLocations();
        await this.createPassiveLocations();
        await this.createActiveExhibitLocation();
        await this.createActiveExhibitBehaviorLocation();
        await this.createNotfiyLocations();

        await this.createLocationNeighbors();

        await this.createContentTypes();
        await this.createContentLanguages();
        await this.createContentStoryTellers();
        await this.createExhibitContent();

        await this.createCoatOfArmsTypes();
        await this.createCoatOfArmsParts();
        await this.createCoatOfArmsColors();
    }

    private initSettings(): void {
        this._connection.settings.create({
            guestNumber: 1,
            wifiSSID: 'MEETeUX'
        });
    }

    private async createLocationTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.locationType.create({id: 1, description: 'room'}),
                this._connection.locationType.create({id: 2, description: 'activeExhibitOn'}),
                this._connection.locationType.create({id: 3, description: 'activeExhibitAt'}),
                this._connection.locationType.create({id: 4, description: 'passiveExhibit'}),
                this._connection.locationType.create({id: 5, description: 'door'}),
                this._connection.locationType.create({id: 6, description: 'activeExhibitBehaviorAt'}),
                this._connection.locationType.create({id: 7, description: 'activeExhibitBehaviorOn'}),
                this._connection.locationType.create({id: 8, description: 'interactiveExhibit'}),
                this._connection.locationType.create({id: 9, description: 'notifyActiveExhibitAt'}),
                this._connection.locationType.create({id: 10, description: 'notifyActiveExhibitOn'})
            ]);
        });
    }

    private async createStatusTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.status.create({id: 1, description: 'online'}),
                this._connection.status.create({id: 2, description: 'offline'}),
                this._connection.status.create({id: 3, description: 'free'}),
                this._connection.status.create({id: 4, description: 'occupied'})
            ]);
        });
    }

    private async createContentTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.contentType.create({id: contentTypes.TEXT, description: 'text'}),
                this._connection.contentType.create({id: contentTypes.IMAGE, description: 'image'}),
                this._connection.contentType.create({id: contentTypes.EVENT, description: 'event'})
            ]);
        });
    }

    private async createContentLanguages() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.contentLanguage.create({id: contentLanguages.ENG, description: 'English', tag: 'ENG'}),
                this._connection.contentLanguage.create({id: contentLanguages.GER, description: 'Deutsch', tag: 'GER'}),
                this._connection.contentLanguage.create({
                    id: contentLanguages.ALL,
                    description: 'All Languages',
                    tag: 'ALL'
                })
            ]);
        });
    }

    private async createContentStoryTellers() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.storyTeller.create({id: storytTellers.MAXIMILIAN, name: 'Maximilian'}),
                this._connection.storyTeller.create({id: storytTellers.SUNTHAYM, name: 'Sunthaym'}),
                this._connection.storyTeller.create({id: storytTellers.TILL, name: 'Till'}),
            ]);
        });
    }

    private async createExhibitContent() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.content.create({
                    content: 'Getreuer Untertan,\nwir, Maximilian, begrüßen dich hier vor unserem Thron. Bei deinem Besuch wirst du mehr über uns, ' +
                        'den Erzherzog von Österreich und Kaiser des Heiligen Römischen Reichs, und unsere Geschichte erfahren. Die Zeit, in der wir gelebt haben, ' +
                        'war anders als deine Zeit – aber auch sie war geprägt von Umbrüchen! Lass dich von dieser App durch das ausgehende Mittelalter leiten und ' +
                        'löse dabei spannende Rätsel. Richtige Antworten schalten Bestandteile für dein persönliches Wappen frei, das wir dir später verleihen werden. ' +
                        'Viel Erfolg!\n',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 1000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Werter Freund,\nschön, Sie hier in diesem Zentrum der Gelehrsamkeit begrüßen zu dürfen! Ich, Ladislaus Sunthaym, habe in Klosterneuburg ' +
                        'die Familiengeschichte des Stiftsgründers Markgraf Leopold III. erforscht, nun möchte auch Kaiser Maximilian, dass ich einen Stammbaum für ihn anfertige.' +
                        ' Was für eine Ehre in den Kreis seiner Gelehrten aufgenommen zu werden! Ich teile mein Wissen gerne: Lassen Sie sich von mir durch die Ausstellung ' +
                        'leiten und helfen Sie mir dabei, Rätsel zu lösen! Richtige Antworten schalten Teile für Ihr persönliches Wappen frei, das Ihnen später vom Kaiser ' +
                        'verliehen wird.\n',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 1000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Sieh sie dir an, die feinen Leute: Wie sie mit ihren Juwelen und teuren Gewändern angeben und prächtige Zeremonien vollführen! Vielleicht kennst ' +
                        'du mich, ich heiße Till Eulenspiegel. Nicht immer bin ich gern gesehen, denn ich treibe oftmals Scherze. Mein Platz ist Abseits des Geschehens, ' +
                        'das ich dennoch kommentiere: Wenn du mit mir durch die Ausstellung gehst, erfährst du Geschichten, die nicht jeder kennt. Lass uns gemeinsam Rätsel ' +
                        'lösen! Richtige Antworten schalten Teile für dein eigenes Wappen frei, das dir später vom Kaiser verliehen wird. Vielleicht bleibt dabei Zeit für ' +
                        'einen Scherz…',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 1000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Für das ordentliche Führen unserer Geschäfte wurden Rechnungsbücher angelegt. Darin wurden unsere Ausgaben in ' +
                        'verschiedene Kategorien zusammengefasst und verzeichnet.\nDas vorliegende Beispiel stammt aus dem Archiv des Stiftes Klosterneuburg. ' +
                        'Wir möchten dich nicht nur auf das Format und die Dicke dieses Buches hinweisen, sondern auch auf den für unsere Zeit nicht ungewöhnlichen Einband. ' +
                        'Dieser besteht nur aus einem alten, wieder verwendetem Blatt Pergament. Wir wollen wissen, was das Stift Mitte des 15. Jahrhunderts für Boten und ' +
                        'Reisen ausgegeben hat. Finde es für uns heraus!\n',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 101,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Prägung der minderwertigen Währung „Schinderlinge“',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 101,
                    year: 1458
                }),
                this._connection.content.create({
                    content: 'Landtag in Korneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 101,
                    year: 1465
                }),
                this._connection.content.create({
                    content: 'Zerstörungen durch ungarische Truppen rund um Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 101,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'In unserem Erzherzogtum hielt Mitte des 15. Jahrhunderts der Humanismus Einzug, dessen Zentren unser Hof und die Universität Wien war. ' +
                        'Auch Chorherren aus Klosterneuburg studierten dort. Sie fertigten sich ihre Bücher für die Forschung selbst, wie etwa Wolfgang Winthager. ' +
                        'An der Universität musste man übrigens zuerst die sieben freien Künste studieren, darunter Astronomie und Grammatik. Danach konnte man mit ' +
                        'einem Studium in Medizin, Jura oder Theologie fortsetzen. Schloss man sein Studium ab, wurde dies oft in sogenannten Determinationsurkunden ' +
                        'angekündigt. Eine kannst du hier bestaunen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 102,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Vorlesungen der Chorherren Wolfgang Winthager und Johannes Swarcz an der Universität Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 102,
                    year: 1450
                }),
                this._connection.content.create({
                    content: 'Studienabschluss Ladislaus Sunthayms an der Universität Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 102,
                    year: 1465
                }),
                this._connection.content.create({
                    content: 'Berufung Conrad Celtis` an die Universität Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 102,
                    year: 1497
                }),
                this._connection.content.create({
                    content: 'Untertan! Siehe mit eigenen Augen, wie spannend und abwechslungsreich das 15. Jahrhundert war! Politische Machtkämpfe, wirtschaftliche Krisen, ' +
                        'technische Neuerungen, neue geistige Strömungen und Bildungsideale sowie ein neuer Heiliger für unser Herzogtum Österreich – eine sehr faszinierende ' +
                        'Mischung! Wir nehmen euch nun im nächsten Abschnitt auf eine Reise mit, die euch auf der linken Seite durch politische Wirren und ihren Einfluss auf ' +
                        'Klosterneuburg führt. Parallel berichtet die rechte Seite von der Verehrung und Heiligsprechung unseres werten Vorfahren Leopolds III.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Über das 15. Jahrhundert gibt es viel zu erzählen – viel zu viel, als dass ich es Ihnen in kurzer Art und Weise erklären könnte. ' +
                        'Das ist wirklich schade! Nun gut, ich habe mich dazu entschlossen, Ihnen auf der linken Seite des nächsten Ganges ein paar für das Herzogtum ' +
                        'Österreich wichtige politische Ereignisse zu schildern, während es auf der rechten Seite um die Verehrung des babenbergischen Markgrafen Leopold III. ' +
                        'und seine Heiligsprechung 1485 geht.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Tja, dieses ganze Gerede über Politik, Kämpfe und ach so tolle Herrscher langweilt mich! Viel lustiger und interessanter ist doch die ' +
                        'Geschichte von Leopold III.! Kennt ihr schon die Schleierlegende, die Gründungslegende des Stiftes, in dem ihr gerade steht? Oder wisst ihr, ' +
                        'welche tollen Wunder Leopold vollbracht hat? Also wenn ihr etwas über die öde Politik wissen wollt, dann seht euch auf der linken Seite um, und ' +
                        'wenn ihr aber mehr für Geschichten und Wunder über habt, dann seid ihr auf der rechten Seite des Ganges richtig.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Lange vor unserer Geburt kam es in unserer Familie zu Zwistigkeiten. Bruder stellte sich gegen Bruder und was folgte war eine Teilung ' +
                        'unseres Herrschaftsgebietes. Der Weg zur Wiedervereinigung war lang: auch unser Vater Kaiser Friedrich III. lag mit seinem Bruder, unserem ' +
                        'Onkel Albrecht VI., im Disput. Die Streitigkeiten der beiden eskalierten 1461 und unter den bewaffneten Konflikten litt vor allem das Land ' +
                        'unter der Enns. Der plötzliche Tod unseres Onkels 1463 beendete die Machtkämpfe und unser Vater wurde als rechtmäßiger Landesfürst unseres geliebten ' +
                        'Herzogtums Österreich anerkannt.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Die politische Lage im Herzogtum Österreich war nach dem Aussterben der leopoldinischen Linie im Jahr 1457 wieder unklar. ' +
                        'Die Brüder Kaiser Friedrich III. und Herzog Albrecht VI. erhoben beide Anspruch auf das Erbe und die angespannte Situation entlud sich schließlich' +
                        ' 1461 in einem bewaffneten Konflikt. Klosterneuburg unterstützte Albrecht VI., der im Gegenzug versuchte, den ökonomischen Belastungen Klosterneuburgs' +
                        ' mit Handels- und Salzprivilegien entgegenzuwirken. Der Disput endete schließlich mit dem unerwarteten Tod Albrechts und der Anerkennung Friedrichs III.' +
                        ' im Jahr 1463.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Schinderlinge! Das war damals das eigentliche Verbrechen! Als unseren werten Herrschern das Geld für ihre Kriege ' +
                        'und ihre Söldner ausging, ließen sie minderwertige Münzen prägen. Ihnen ging es nur um die Erweiterung ihrer Macht und sie ' +
                        'dachten keineswegs an uns armes Volk! Das Silber unserer schönen Pfennige wurde also nach und nach durch Kupfer und Blei ersetzt. ' +
                        'Sie waren dadurch kaum mehr etwas wert und die damit einhergehende Wirtschaftskrise könnt ihr euch gar nicht vorstellen! Vielen lieben Dank, ' +
                        'meine Herrscher! Das Geld werde ich euch schon noch anderweitig aus der Tasche ziehen!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Tod von Ladislaus Postumus',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    year: 1457
                }),
                this._connection.content.create({
                    content: 'Tod von Albrecht VI.',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    year: 1463
                }),
                this._connection.content.create({
                    content: 'Ausbruch des Krieges zwischen Friedrich III. und Matthias Corvinus',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2001,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'Nach dem Bruderzwist bedrohte der ungarische König Matthias Corvinus unser Herzogtum. Ihm gelang es Ungarn zu vereinen, seine Grenzen gegen ' +
                        'die Türken zu sichern und mit seinen Truppen in unser Land unter der Enns einzumarschieren! Er hatte sich 1477 erdreistet, unserem Vater den Krieg ' +
                        'zu erklären und erst durch Corvinus` Tod 1490 gelangten die eroberten Gebiete wieder in unsere Hände. Man muss diesem Mann aber zähneknirschend ' +
                        'zugestehen, dass er nicht nur Leid über unser Herzogtum brachte, denn um sich Freunde zu machen, unterstützte er etwa den Heiligsprechungsprozess ' +
                        'von Leopold III.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Matthias Corvinus wurde 1458 zum ungarischen König gewählt. Von seinem Ehrgeiz getrieben konnte er nicht nur Ungarn einen, sondern auch ' +
                        'Teile des Herzogtums Österreich erobern. Dazu zählten etwa 1483 Klosterneuburg oder 1485 Wien.\nIch muss Ihnen sagen, dass ich nicht nur von ' +
                        'seinen strategischen Leistungen beeindruckt bin, sondern auch von seiner humanistischen Bildung sowie seinem Interesse an Kunst und Kultur. ' +
                        'Einer der Gelehrten, die er an seinem Hof um sich scharen konnte, war der italienische Historiograph Antonio Bonfini, der ein großartiges Werk über ' +
                        'die ungarische Geschichte verfasste.\n',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Diese Fürsten! Sie streiten immer nur untereinander und versuchen sich gegenseitig zu übertrumpfen! Wer hat die besseren Gelehrten um sich? ' +
                        'Wer hat die edelsten Ahnen? Wer ist der größere Kriegsherr? Als würde mich das interessieren! Das Volk blutete. So etwa verlor der Klosterneuburger ' +
                        'Wolfgang Wiesinger, Gott sei seiner Seele gnädig, dieser arme Tropf, sein Leben im Konflikt zwischen der habsburgischen Erzschlafmütze Friedrich III. ' +
                        'und dem ungarischen Aufsteiger Matthias Corvinus.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Matthias Corvinus besucht Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    year: 1470
                }),
                this._connection.content.create({
                    content: 'Klosterneuburg wird von den Ungarn eingenommen',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    year: 1483
                }),
                this._connection.content.create({
                    content: 'Ausbruch des Krieges zwischen Friedrich III. und Matthias Corvinus',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    year: 1485
                }),
                this._connection.content.create({
                    content: 'Tod von Matthias Corvinus in Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2003,
                    year: 1490
                }),
                this._connection.content.create({
                    content: 'Markgraf Leopold III. wurde zu Recht bereits kurz nach seinem Tod verehrt. Nach einem gescheiterten Heiligsprechungsversuch ' +
                        'durch unseren edlen Vorfahren Rudolf IV. war es schließlich unser Vater Kaiser Friedrich III., der 1465 einen neuerlichen Kanonisationsprozess ' +
                        'ins Rollen brachte. Papst Paul II. setzte eine Kommission ein, um die Wunder Leopolds zu untersuchen und um festzustellen, ob Leopold in den ' +
                        'Kreis der Heiligen aufgenommen werden sollte. Beim ersten Zeugenverhör in Klosterneuburg 1468 erschienen 191 treue Untertanten, worauf wir ' +
                        'besonders stolz sind!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Der Babenberger Leopold III. wurde früh nach seinem Tod im Jahr 1136 verehrt. Sein Grab im Stift Klosterneuburg zog ' +
                        'immer mehr Pilger an und auch das herrschende Geschlecht der Habsburger interessierte sich zunehmend für den Kult um Leopold. Herzog ' +
                        'Rudolf IV. etwa setzte sich für die Heiligsprechung Leopolds ein, aber erst unter Kaiser Friedrich III. kam es zu Zeugenbefragungen ' +
                        'durch eine päpstliche Untersuchungskommission. 1468, 1469 und 1470 wurden über 240 Menschen zu den Wundern Leopolds befragt, ihre ' +
                        'Aussagen aufgezeichnet, notariell beglaubigt und zur Überprüfung nach Rom gesandt.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Ich muss euch eines meiner liebsten Wunder erzählen: Eine Frau hatte Geldsorgen und sie war gezwungen ihren Mantel zu verpfänden. ' +
                        'Der Pfandleiher forderte das Geld sehr bald zurück, sie konnte aber nicht bezahlen. Die Frau wandte sich an Leopold, der ihr schließlich im ' +
                        'Traum erschien und von einem Schatz erzählte. Sie konnte ihn zunächst nicht finden und erst als ihr Leopold noch einmal erschienen war, fand sie ' +
                        'die versprochenen Münzen. Damit konnte sie ihre Schulden bezahlen und es blieb ihr sogar noch Geld über. Ist dieses Wunder nicht toll? Ich glaube, ' +
                        'ich gehe jetzt kurz schlafen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Zeugenbefragung in Klosterneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    year: 1468
                }),
                this._connection.content.create({
                    content: 'Zeugenbefragung in Klosterneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    year: 1469
                }),
                this._connection.content.create({
                    content: 'Zeugenbefragung im Klosterneuburger Hof zu Wien',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2002,
                    year: 1470
                }),
                this._connection.content.create({
                    content: 'Untertanen, auch als Herrscher braucht man Geduld: Leopolds Heiligsprechungsprozess zog sich in die Länge. ' +
                        'Nachdem die unterfertigten Aussagen der Zeugenbefragungen 1470 nach Rom gesandt worden waren, entschied Papst Sixtus IV., ' +
                        'dass der Prozess aufgrund formaler Mängel abgebrochen und wiederholt werden musste. Dies war natürlich ein Rückschlag für ' +
                        'unseren Vater und unser Erzherzogtum, doch sie gaben nicht auf! Es waren weitere 15 Jahre und hohe finanzielle Mittel notwendig, ' +
                        'bis Papst Innozenz VIII. schließlich die Heiligkeit Leopolds anerkannte und ihn in das Verzeichnis der Heiligen aufnahm.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2004,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Der Ablauf von Heiligsprechungsprozessen war komplex. Es musste nicht nur eindeutig nachgewiesen werden, ' +
                        'dass die Person einer Heiligsprechung würdig war, sondern es mussten auch viele formale Kriterien eingehalten ' +
                        'werden. Gründe, warum Leopolds Kanonisationsprozess 20 Jahre dauerte, waren unter anderem bürokratische Fehler, ' +
                        'Todesfälle beteiligter Personen sowie sehr hohe Kosten. Am Ende half vor allem auch eine Verteidigungsrede zugunsten ' +
                        'Leopolds, die von Franciscus de Pavinis verfasst wurde. Am 6. Jänner 1485 wurde Leopold während einer feierlichen Zeremonie ' +
                        'im Petersdom heilig gesprochen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2004,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Sieh ihn dir an! Sieht er nicht herrschaftlich in seinem Markgrafen-Ornat und mit dem Erzherzogshut am Kopf aus? ' +
                        'Unter uns: historisch richtig ist das nicht, denn Leopold III. war kein Erzherzog, aber wenn sie den Erzherzogshut einfach ' +
                        'weggelassen hätten, würde dem Bild etwas fehlen, findest du nicht? Interessant finde ich ja auch das Stiftsmodell, das er in der Hand hält. ' +
                        'Es steht sicher für seine Gründung von Klosterneuburg! Auch der Heiligenschein ist sehr beeindruckend – ob ich wohl auch mal so einen bekommen werde? ' +
                        'Träumen darf man ja noch und wer weiß, vielleicht geschieht ja ein Wunder!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 2004,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Wir, Maximilian, stellen uns vor: Geboren wurden wir am 22. März 1459 in Wiener Neustadt. Unser Vater Friedrich war zu dieser Zeit ' +
                        'schon Kaiser des Heiligen Römischen Reichs. Unsere Mutter Eleonore kam von weit her: Sie war die Tochter des portugiesischen Königs. 1486 ' +
                        'wurden wir zum römisch-deutschen König gekrönt, 1493 bekamen wir die Herrschaft über die habsburgischen Erblande und 1508 ließen wir uns in ' +
                        'Trient zum römisch-deutschen Kaiser krönen. Eines der Glanzstücke unserer Regierung war unsere kluge Heiratspolitik, die unserem edlen Haus ' +
                        'Habsburg Böhmen und Ungarn sicherte.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 3000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Kaiser Maximilian hat mich beauftragt, einen Stammbaum für ihn anzufertigen. Lassen Sie uns damit beginnen! Maximilian ist der ' +
                        'Sohn Kaiser Friedrichs III. und Eleonores von Portugal. 1477 heiratete er Maria von Burgund, deren Vater kurz zuvor gestorben war. So ' +
                        'wurde Maximilian zum Herzog von Burgund. Viele Ideen, die er dort kennenlernte, flossen später in seine Regierung ein. Maria starb 1482, ' +
                        'gemeinsam hatten sie zwei Kinder: Philipp, später König von Kastilien, und Margarete, später Statthalterin der habsburgischen Niederlande. ' +
                        '1494 heiratete er Bianca Maria Sforza, die Ehe blieb kinderlos.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 3000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Ein Komet soll am Himmel erschienen sein, als Maximilian im Jahr 1459 geboren wurde. Ich kenne noch ein anderes Kind, dessen Geburt von ' +
                        'einem Stern angekündigt wurde – du kannst dir sicher denken, welches… das Jesuskind. Tja, netter Versuch sich in Szene zu setzten, mein ' +
                        'lieber Maximilian! In Chroniken und Berichten, die nicht von deinen Geschichtsschreibern stammen, ist nämlich keine Rede von einem Kometen. ' +
                        'Es ist überhaupt ungewöhnlich, dass die Gelehrten Maximilians diesen Kometen erwähnten, denn im Spätmittelalter wurden Kometen zumeist als ' +
                        'Vorzeichen für Katastrophen gedeutet!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 3000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Wir, Maximilian, verlangen nun deine Dienste, Untertan! Wir haben unseren Sekretär, ' +
                        'Marx Treitzsaurwein, damit beauftragt, unsere Lebensgeschichte mit all unseren Heldentaten und ' +
                        'Errungenschaften niederzuschreiben und in Druck zu geben. Hilf unserem Sekretär, die Geschichte des Weißkunigs zu schreiben! ' +
                        'Du wirst Holzschnitte sehen, die unsere Hofkünstler angefertigt haben. Beantworte die Fragen dazu richtig und du wirst reich belohnt werden. ' +
                        'Vom Bettler wirst du zum Adeligen aufsteigen, wenn du in der Lage bist, unser Leben und unsere Taten so zu erzählen, wie wir sie gerne lesen möchten.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 301,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Geburt Maximilians I.',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 301,
                    year: 1459
                }),
                this._connection.content.create({
                    content: 'Maximilian nimmt zum ersten Mal an einer Reichsversammlung teil',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 301,
                    year: 1471
                }),
                this._connection.content.create({
                    content: 'Heirat mit Maria von Burgund',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 301,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'Nach der Heiligsprechung Leopolds III. setzte das Stift Klosterneuburg den Heiligen in Szene. ' +
                        'Die Pröpste, allen voran der am 1. Juli 1485 gewählte Jakob Paperl, trieben diese Entwicklungen an und wir konnten dabei sogar ' +
                        'Anregungen für unseren Hof finden. Seit der Heiligsprechung findet man in den Missalen am 15. November das Fest des Heiligen Leopold ' +
                        'eingetragen. Außerdem entstanden Gemälde, Handschriften und Drucke, die sich mit Leopold beschäftigten. Einer der engagierten Gelehrten war ' +
                        'unser späterer Genealoge, der dir bereits bekannt ist: Ladislaus Sunthaym. Sieh dir an, was er erzählt!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Nach der Heiligsprechung des Stiftsgründers habe ich den Auftrag angenommen, eine Genealogie Leopolds III. zu verfassen. ' +
                        'Für dieses Vorhaben reiste ich von Kloster zu Kloster, um die historischen Aufzeichnungen einzusehen und zu bewerten. Es ist wichtig ' +
                        'korrekt zu arbeiten, doch konnte ich so manches Rätsel nicht lösen. Von einigen Personen aus der Familie des Markgrafen sind keine Namen ' +
                        'belegt. Sehr schwierig ist es auch, Aufzeichnungen über die Ehefrauen und Töchter zu finden. Wem ich den Text gewidmet habe, erzähle ich Ihnen gleich.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Der alte Sunthaym legte sich ja recht ins Zeug, um die verstaubte Geschichte der Babenberger auszugraben. ' +
                        'Viel zu viel Aufwand, wenn du mich fragst. Das liest doch sowieso keiner, noch dazu, wenn die Geschichte in so kleiner Schrift auf ' +
                        'Pergament geschrieben ist. Die hierfür angefertigten acht Tafeln sollen noch dazu hinter einem Gitter gehangen haben – um das zu lesen braucht ' +
                        'man doch Adleraugen! Aber wenigstens die lustigen Tiere in den Ranken machen einem Freude, vor allem der Kriegselefant. Alle „Sunthaym-Tafeln“ ' +
                        'findest du übrigens im oberen Bereich der Ausstellung.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Die Arbeiten Sunthayms haben unser kaiserliches Interesse geweckt. ' +
                        'Immerhin sind diese „Sunthaym-Tafeln“ nicht nur inhaltlich ansprechend, sondern sie sehen auch sehr prächtig aus! ' +
                        'Gold und bunte Farben zieren die Herkunftsgeschichte unserer Vorfahren – wahrlich angemessen! Da die Herkunft für uns als Herrscher von ' +
                        'besonderer Bedeutung ist, befahlen wir dem Gelehrten auch die Vergangenheit unserer edlen und altehrwürdigen Familie erforschen! Mit dieser ' +
                        'ehrenwerten Aufgabe haben wir aber nicht nur ihn beauftragt, auch andere Personen arbeiteten diesbezüglich für uns.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Wem ich meine Genealogie gewidmet habe, möchten Sie wissen? Selbstverständlich Gott, der Jungfrau Maria und dem Heiligen Leopold, ' +
                        'immerhin bin ich Geistlicher. Allerdings kam ich selbstverständlich nicht umhin, auch Kaiser Friedrich III. und seinen Sohn Maximilian hier ' +
                        'zu erwähnen, und natürlich meinen Auftraggeber, den Propst Jakob Paperl. Wie ich diese Widmung formuliert habe, können Sie ein paar Schritte ' +
                        'weiter sehen. Vielleicht klingt es ein wenig sperrig, aber die Titel der Herrscher konnte ich kaum kürzen. Es muss schließlich alles seine ' +
                        'Richtigkeit haben, das verstehen Sie doch!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4001,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Du meine Güte, was für ein Speichellecker dieser Sunthaym doch ist! Muss natürlich immer alles ganz korrekt machen; Gott, Herrscher ' +
                        'und Auftraggeber brav nennen und ihnen alles recht machen. So hat er sogar die Gunst des Kaisers erlangt! Wenn du mich fragst, ich bin ja ' +
                        'eher dafür, für wenig Aufwand, ordentlich verköstigt und bezahlt zu werden. Die Herrscher und Grundherren können sich’s doch ohnehin leisten, ' +
                        'oder? Tatsächlich habe ich es oft geschafft, die Großen übers Ohr zu hauen. Wie mir das gelungen ist, erfährst du im oberen Teil der Ausstellung.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4001,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Dies ist eine der prachtvollen acht „Sunthaym-Tafeln“: Diese Pergamentblätter erzählen die Genealogie der Babenberger, wie sie ' +
                        'unser getreuer Gelehrter Ladislaus Sunthaym zusammengetragen hat. Insgesamt werden auf den Tafeln 75 Männer und Frauen aus der Familie der ' +
                        'Babenberger vorgestellt. Jede Person wird von einer Initiale eingeleitet, also einem geschmückten Anfangsbuchstaben. Das große G ist der ' +
                        'erste Buchstabe des Kolophons, eine Art Widmung des Textes. Halte dein Mobiltelefon über die beiden großen Initialen um den Text zu lesen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 402,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Werter Untertan, wir hören gerne wundersame Geschichten. Dies vertreibt uns neben der Jagd unsere Zeit. Unterhalte uns mir ' +
                        'einer spannenden Erzählung und du wirst belohnt! Um die Gründung des Stifts Klosterneuburg rankt sich die sogenannte "Schleierlegende". ' +
                        'Versuche in diesem Spiel, diese Legende auf einer interaktiven Bühne nachzubauen!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 403,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Erwähnung des heiligen Koloman in den Sunthaym-Tafeln auf',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 403,
                    year: 1491
                }),
                this._connection.content.create({
                    content: 'Abbildung der Bogenlegende auf dem Babenbergerstammbaum',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 403,
                    year: 1492
                }),
                this._connection.content.create({
                    content: 'Die Frueauf-Tafeln mit der Klosterneuburger Schleierlegende werden angefertigt',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 403,
                    year: 1505
                }),
                this._connection.content.create({
                    content: 'Untertan – sieh dir nur diese prächtigen Tafeln von Rueland Frueauf dem Jüngeren an! Sie zeigen die Legende der ' +
                        'Gründung des Stiftes Klosterneuburg durch unseren Vorfahren Leopold III. Was für ein mächtiger Fürst er doch war und ein ' +
                        'geschickter Jäger, wie auch wir einer sind! So war Leopold auch auf der Jagd, als er den Jahre zuvor verlorenen Schleier seiner ' +
                        'Frau Agnes unversehrt in einem Holunderstrauch fand. Welch wundersames Ereignis, denn sogar die Mutter Gottes erschien ihm! Zum Dank ' +
                        'ließ er an dieser Stelle das Stift Klosterneuburg erbauen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4004,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Diese Tafeln mit alten Malereien sind die ersten, die uns die Legende der Klostergründung durch den heiligen Markgrafen ' +
                        'in mehreren Bildern vor Augen führen. Rueland Frueauf der Jünger hat sie mit ‚RF‘ signiert. Dieser Maler, der den heiligen ' +
                        'Markgrafen nicht nur in diesem Werk ins Bild setzte, hat sich auch durch die große Tafel mit dem Heiligen und dem Modell der ' +
                        'Stiftskirche verdient gemacht hat. Seine Frau Dorothea taucht übrigens in den Totenbüchern des Stiftes Klosterneuburg auf. ' +
                        'Auch Ruelands Vater war Maler, er trug denselben Vornamen und wird Frueauf der Ältere genannt.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4004,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Ein edler Fürst, Markgraf Leopold auf der Jagd, könnt‘ er mich brauchen? Nun weiß ich mit Worten viel anzustellen, ' +
                        'doch mit dem Spieß? Welch Glück, dass Leopolds Mannen unerschrocken waren und von einigen furchtlosen Jagdhunden begleitet wurden. ' +
                        'Die bellenden Begleiter preschten wie uns die Bilder erzählen, in den Wald hinein und waren im Moment der Auffindung des Schleiers zugegen. ' +
                        'Man erzählt sich, dass alle Hunde, die in den Zwingern in Klosterneuburg gehalten werden, von jenen abstammen, die bei dem heiligen Ereignis ' +
                        'dabei waren.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 4004,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Was für ein herausragender Tag! Am 15. Februar 1506 war es endlich soweit und mehr als 20 Jahre nach der Heiligsprechung unseres ' +
                        'Vorfahren Leopolds III. kam es zu den Translationsfeierlichkeiten, also der Erhebung und der Umbettung seiner Gebeine. Diesem tollen ' +
                        'Ereignis wohnten unzählige unserer Untertanen bei und natürlich nahmen auch wir an diesen Feierlichkeiten teil! Ganz bewusst entschieden ' +
                        'wir uns an diesem Tag nicht, das uns zustehende königliche Ornat zu tragen, sondern im Gedenken an den Heiligen und für unser geliebtes ' +
                        'Erzherzogtum Österreich wählten wir die erzherzogliche Kleidung.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 5000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Erst durch die Translation, die zeremonielle Erhebung der Gebeine, fanden Heiligsprechungen ihren offiziellen Abschluss. ' +
                        'Ich muss Ihnen sagen, dass die Translation in Leopolds Fall erst sehr spät stattfand. Zunächst lag es an der ungarischen Herrschaft ' +
                        'über Klosterneuburg, die die Anwesenheit der habsburgischen Fürsten bei der Translation nicht zuließ und dann war König Maximilian I. ' +
                        'zu sehr in die Geschäfte des Reiches verstrickt, um persönlich an den Feierlichkeiten teilzunehmen. Es musste bis Februar 1506 gewartet ' +
                        'werden, doch dafür waren die Feierlichkeiten umso schöner!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 5000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Was für ein Tag! Es war sensationell! Die Menschenmassen, das Essen, das Spektakel! Unser Erzherzog nahm trotz ' +
                        'seiner ganzen Verpflichtungen auch an den Feierlichkeiten teil, aber mal ganz unter uns: wenn ich es schaffe, an diesem ' +
                        'bedeutsamen Tag in Klosterneuburg zu sein, dann sollte es auch kein Problem für unseren Herrscher sein. Ihm wurde auch der nach ' +
                        'der Heiligsprechung angefertigte, riesige Babenbergerstammbaum gezeigt. Meine Einladung dafür muss der Bote wohl verloren haben!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 5000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Um unsere Verehrung zu zeigen, wollten unser ehrwürdiger Vater und wir für den neuen Heiligen einen besonderen Schrein anfertigen lassen. ' +
                        'Unser Vater versuchte sogar unseren Vetter Sigismund, welcher Regent unseres geliebten Landes Tirol war, zu überreden etwas Silber beizusteuern.\n' +
                        'Mit der Vergabe des Auftrages betrauten wir das Stift Klosterneuburg, dem wir dafür Geld aus unseren königlichen Schmelzhütten in Tirol zur ' +
                        'Verfügung stellten. Der prachtvolle Sarg wog schließlich 436,5 Mark Silber und die Gebeine Leopolds fanden darin 1506 eine neue Ruhestätte.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 501,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Getreuer Lieber,\n' +
                        'wir gewähren dir nun die Ehre, dich zur Audienz zu empfangen. Beim Lösen der Aufgaben hast du uns große Dienste erwiesen. ' +
                        'Dies soll nicht unbelohnt bleiben: Deinem Stand gemäß verleihen wir dir jetzt dein persönliches Wappen. Damit wirst du Teil ' +
                        'unserer erlesenen Hofgesellschaft und erhältst das Privileg, weitere Räumlichkeiten zu erkunden. Verfüge dich nun in den oberen ' +
                        'Bereich der Ausstellung, um mehr über unser Bestreben nach Erinnerung zu erfahren! Möglicherweise erlangst du dadurch noch eine ' +
                        'Aufwertung deines Wappens. Du darfst dich nun entfernen!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 5001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Das sind sie, die edlen Ahnen unseres erlauchten Hauses Habsburg. Leopold der Heilige ist ebenso darauf zu finden wie ' +
                        'einige seiner 18 Kinder. Sein Sohn Heinrich II., auch genannt Jasomirgott, wurde der erste Herzog Österreichs, aber auch die ' +
                        'anderen Babenberger haben spannende Lebensgeschichten! Sie führten Kriege, stachen in See gen Heiliges Land, waren Vermittler in ' +
                        'Reichsangelegenheiten und über Ehen kamen Verbindungen mit bedeutenden Fürstengeschlechtern zustande. Finde heraus, wann und wo die ' +
                        'Babenberger lebten, mit wem sie verheiratet waren und wie ihre Töchter und Söhne hießen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 502,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Untertan, nun hast du den oberen Teil der Ausstellung gesehen. Bist du beeindruckt von den Mühen, ' +
                        'die wir auf uns genommen haben, um in Erinnerung zu bleiben? Unser Vorhaben war von Erfolg gekrönt. Mit dem ' +
                        'Besuch der Ausstellung hast auch du unser gedacht, dafür sei dir unser höchster Dank ausgedrückt. Als Lohn steht ' +
                        'dir eine Wappenbesserung zu. Führe dein Wappen mit Ehre und Stärke und merke dir eines: Sorg dafür, dass du nach deinem Tod nicht vergessen wirst!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 6000,
                    storyTellerId: storytTellers.MAXIMILIAN
                })
            ]);
        });
    }

    private async createRoomLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 1,
                    description: 'Klosterneuburg',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 10,
                    description: 'Section (10): introduction',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 20,
                    description: 'Section (20): canonization and conflicts',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 30,
                    description: 'Section (30): maximilian',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 40,
                    description: 'Section (40): Klosterneuburg legend',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 50,
                    description: 'Section (50): translation',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 60,
                    description: 'Section (60): death',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                })
            ]);
        });
    }

    private async createDoorLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 1000,
                    description: 'Intro to section 1:',
                    titleGER: "Des Kaiser neuer Heiliger",
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 10,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 2000,
                    description: 'Intro to section 2:',
                    titleGER: 'Konflikt und Kanonisation',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 20,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1507,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 3000,
                    description: 'Intro to section 3:',
                    titleGER: 'Maximilian I.',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 30,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1577,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 4000,
                    description: 'Intro to section 4:',
                    titleGER: 'Das Stift und der Propst',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 40,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1485,
                    endDate: 1505,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 5000,
                    description: 'Intro to section 5:',
                    titleGER: 'Erhebung der Gebeine',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 50,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 6000,
                    description: 'Intro to section',
                    titleGER: 'Totengedenken',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 60,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1519,
                    endDate: 1520,
                    unlockCoa: true,
                    contentURL: 'passive'
                })
            ]);
        });
    }

    private async createActiveExhibitLocation() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 101,
                    parentId: 10,
                    description: 'Explore transcription of accounting book',
                    titleGER: 'Geld und Verwaltung',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499
                }),
                this._connection.location.create({
                    id: 102,
                    parentId: 10,
                    description: 'Solve exercise',
                    titleGER: 'Wissenschaft und Universität',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499
                }),
                this._connection.location.create({
                    id: 402,
                    parentId: 40,
                    description: 'Doing something with panel',
                    titleGER: 'Sunthaym verstehen',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1491,
                    endDate: 1492,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 501,
                    parentId: 50,
                    description: 'Observe the inside of shrine',
                    titleGER: 'Letzte Ruhestätte',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    unlockCoa: true
                }),
            ]);
        });
    }

    private async createActiveExhibitBehaviorLocation() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 301,
                    parentId: 30,
                    description: 'Weyßkunig Quiz atLocation',
                    titleGER: 'Weißkunig Quiz ',
                    contentURL: 'tableat',
                    ipAddress: '192.168.178.252',
                    locationTypeId: locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 15,
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1577,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 3011,
                    description: 'Weyßkunig Quiz onLocation',
                    parentId: 301,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON,
                    contentTypeId: 1,
                    statusId: 2
                })
            ]);
        });
    }

    private async createNotfiyLocations()
    {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 403,
                    parentId: 40,
                    description: 'Legend game AtLocation',
                    titleGER: 'Es war einmal…',
                    contentURL: 'tableNotifyAt',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.NOTIFY_EXHIBIT_AT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 1,
                    showInTimeline: true,
                    startDate: 1491,
                    endDate: 1505,
                    unlockCoa: true
                }),
                this._connection.location.create({
                        id: 4031,
                        description: 'Legend game AtLocation OnLocation',
                        parentId: 403,
                        contentURL: 'tableNotifyAt',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
                        contentTypeId: 1,
                        statusId: 2
                    }),
                    this._connection.location.create({
                        id: 502,
                        parentId: 50,
                        description: 'Genvis atLocation',
                        titleGER: 'Stammbaum der Babenberger',
                        contentURL: 'tableNotifyAt',
                        ipAddress: '192.168.178.48',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_AT,
                        contentTypeId: 1,
                        statusId: 2,
                        currentSeat: 0,
                        maxSeat: 2,
                        showInTimeline: true,
                        startDate: 1506,
                        endDate: 1507,
                        unlockCoa: true
                    }),
                    this._connection.location.create({
                        id: 5021,
                        description: 'Genvis onLocation',
                        parentId: 502,
                        contentURL: 'tableNotifyOn',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
                        contentTypeId: 1,
                        statusId: 2,
                        locationTag: 'left'
                    }),
                    this._connection.location.create({
                        id: 5022,
                        description: 'Genvis onLocation',
                        parentId: 502,
                        contentURL: 'tableNotifyOn',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
                        contentTypeId: 1,
                        statusId: 2,
                        locationTag: 'right'
                    })
            ]);
        });
    }

    private async createPassiveLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 2001,
                    parentId: 20,
                    description: 'passive exhibit',
                    titleGER: 'Familienzwist ',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1493
                }),
                this._connection.location.create({
                    id: 2002,
                    parentId: 20,
                    description: 'passive exhibit',
                    titleGER: 'Wunder und Zeugen',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1468,
                    endDate: 1470
                }),
                this._connection.location.create({
                    id: 2003,
                    parentId: 20,
                    description: 'passive exhibit',
                    titleGER: 'Matthias Corvinus',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1470,
                    endDate: 1490
                }),
                this._connection.location.create({
                    id: 2004,
                    parentId: 20,
                    description: 'passive exhibit',
                    titleGER: 'Der Heilige Leopold',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1507,
                    endDate: 1508
                }),
                this._connection.location.create({
                    id: 4001,
                    parentId: 40,
                    description: 'passive exhibit',
                    titleGER: 'Sunthayms Forschungen',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1485,
                    endDate: 1486
                }),
                this._connection.location.create({
                    id: 4004,
                    parentId: 40,
                    description: 'passive exhibit',
                    titleGER: 'Die Schleierlegende',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1505,
                    endDate: 1506
                }),
                this._connection.location.create({
                    id: 5001,
                    parentId: 50,
                    titleGER: 'Audienz beim Kaiser',
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    unlockCoa: true
                })
            ]);
        });
    }

    private async createLocationNeighbors()
    {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.neighbor.create({
                    prevLocation: 1000,
                    nextLocation: 101
                }),
                this._connection.neighbor.create({
                    prevLocation: 101,
                    nextLocation: 102
                }),
                this._connection.neighbor.create({
                    prevLocation: 102,
                    nextLocation: 2000
                })
            ]);
        });
    }

    private async createCoatOfArmsParts() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaPart.create({
                    id: 10,
                    coaTypeId: 1,
                    name: 'Curved Shield',
                    image: 'Shield1'
                }),
                this._connection.coaPart.create({
                    id: 11,
                    coaTypeId: 1,
                    name: 'Rounded Shield',
                    image: 'Shield2'
                }),
                this._connection.coaPart.create({
                    id: 12,
                    coaTypeId: 1,
                    name: 'Ornamental Shield',
                    image: 'Shield3'
                }),
                this._connection.coaPart.create({
                    id: 13,
                    coaTypeId: 1,
                    name: 'Classic Shield',
                    image: 'Shield4'
                }),
                this._connection.coaPart.create({
                    id: 20,
                    coaTypeId: 2,
                    name: 'Eagle',
                    image: 'Emblem2',
                    taskENG: 'Switch to Sunthaym’s perspective on any exhibit.',
                    taskGER: 'Wechsle zu Sunthayms Geschichte in irgendeinem Ausstellungsstück.'
                }),
                this._connection.coaPart.create({
                    id: 21,
                    coaTypeId: 2,
                    name: 'Lion',
                    image: 'Emblem5',
                    taskENG: 'Have 5 questions right in the Weißkunig game.',
                    taskGER: 'Habe 5 Fragen richtig in dem Weißlunig Quiz.'
                }),
                this._connection.coaPart.create({
                    id: 22,
                    coaTypeId: 2,
                    name: 'Dragon',
                    image: 'Emblem1',
                    taskENG: 'Create the legend of Klosterneuburg in the Legend Game.',
                    taskGER: 'Erstellen Sie die Legende von Klosterneuburg in dem Legendenspiel.'
                }),
                this._connection.coaPart.create({
                    id: 23,
                    coaTypeId: 2,
                    name: 'Horse',
                    image: 'Emblem6',
                    taskENG: 'Participate in the Legend Game.',
                    taskGER: 'Nehmen Sie am Legendenspiel teil.'
                }),
                this._connection.coaPart.create({
                    id: 24,
                    coaTypeId: 2,
                    name: 'Gryphon',
                    image: 'Emblem3',
                    taskENG: 'Attend the audience (unlock all exhibits until throne).',
                    taskGER: 'Nehmen Sie an der Audienz teil (Besuchen Sie alle Ausstellungsstücke).'
                }),
                this._connection.coaPart.create({
                    id: 25,
                    coaTypeId: 2,
                    name: 'Unicorn',
                    image: 'Emblem4',
                    taskENG: 'Participate in the GenVis',
                    taskGER: 'Nehmen sie an dem GenVis teil.'
                }),
                this._connection.coaPart.create({
                    id: 30,
                    coaTypeId: 3,
                    name: 'Side-facing knight helmet',
                    image: 'Helmet1',
                    taskENG: 'Explore the Sunthaym Panels with AR.',
                    taskGER: 'Entdecken Sie die Sunthaym-Panels mit AR'
                }),
                this._connection.coaPart.create({
                    id: 31,
                    coaTypeId: 3,
                    name: 'Front-facing helmet',
                    image: 'Helmet2',
                    taskENG: 'Create any legend in the Legend Game.',
                    taskGER: 'Erstellen sie eine beliebige Legende im Legendenspiel'
                }),
                this._connection.coaPart.create({
                    id: 32,
                    coaTypeId: 3,
                    name: 'Decorated helmet',
                    image: 'Helmet3',
                    taskENG: 'Have 10 questions right in the Weißkunig game.',
                    taskGER: 'Beantworten Sie 10 Fragen richtig im Weißkunig Quiz.'
                }),
                this._connection.coaPart.create({
                    id: 33,
                    coaTypeId: 3,
                    name: 'Crowned helmet',
                    image: 'Helmet4',
                    taskENG: 'Learn more about Maximilian’s death on the upper floor.',
                    taskGER: 'Erfahre mehr über Maximilians Tod im oberen Stockwerk'
                }),
                this._connection.coaPart.create({
                    id: 40,
                    coaTypeId: 4,
                    name: 'Crossed swords',
                    image: 'Mantle1',
                    taskENG: 'Explore the shrine with AR.',
                    taskGER: 'Erkunde den Schrein mit AR.'
                }),
                this._connection.coaPart.create({
                    id: 41,
                    coaTypeId: 4,
                    name: 'Crossed axes',
                    image: 'Mantle2',
                    taskENG: 'Switch to Till’s perspective on any exhibit.',
                    taskGER: 'Schauen Sie sich Tills Geschichte an bei einem beliebigen Ausstellungsstück.'
                }),
                this._connection.coaPart.create({
                    id: 42,
                    coaTypeId: 4,
                    name: 'Ornamental mantling',
                    image: 'Mantle3',
                    taskENG: 'Participating in the Weißkunig game.',
                    taskGER: 'Nehmen Sie am Weißkunigspiel teil.'
                }),
                this._connection.coaPart.create({
                    id: 43,
                    coaTypeId: 4,
                    name: 'Wings',
                    image: 'Mantle4',
                    taskENG: 'Find one special person in the GenVis.',
                    taskGER: 'Finden Sie eine besondere Person im GenVis Spiel.'
                })
            ]);
        });
    }

    private async createCoatOfArmsTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaType.create({
                    id: 1,
                    description: 'shield'
                }),
                this._connection.coaType.create({
                    id: 2,
                    description: 'symbol'
                }),
                this._connection.coaType.create({
                    id: 3,
                    description: 'helmet'
                }),
                this._connection.coaType.create({
                    id: 4,
                    description: 'mantling'
                }),
            ]);
        });
    }

    private async createCoatOfArmsColors() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaColor.create({
                    id: 1,
                    name: 'Color1'
                }),
                this._connection.coaColor.create({
                    id: 2,
                    name: 'Color2'
                }),
                this._connection.coaColor.create({
                    id: 3,
                    name: 'Color3'
                }),
                this._connection.coaColor.create({
                    id: 4,
                    name: 'Color4'
                }),
                this._connection.coaColor.create({
                    id: 5,
                    name: 'Color5'
                })
            ]);
        });
    }

    set connection(value: any) {
        this._connection = value;
    }
}