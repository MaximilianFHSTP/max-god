import {Connection} from "./connection";
import * as contentTypes from '../config/contentTypes';
import * as contentLanguages from '../config/contentLanguages';
import * as storytTellers from '../config/contentStoryTellers';
import * as locationTypes from '../config/locationTypes';
import {LocationController, OdController} from "../controller";
import {CoaController} from "../controller/coaController";

export class DataFactory {
    private static _instance: DataFactory;
    private _connection: Connection;

    private _odController: OdController;
    private _locationController: LocationController;
    private _coaController: CoaController;

    constructor()
    {
        this._odController = new OdController();
        this._locationController = new LocationController(null);
        this._coaController = new CoaController();
    }

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
        await this.createGermanExhibitContent();
        await this.createEnglishExhibitContent();

        await this.createCoatOfArmsTypes();
        await this.createCoatOfArmsParts();
        await this.createCoatOfArmsColors();

        // create user for iOS submission (everything is unlocked)
        await this.createiOSSubmissionUser();
    }

    private initSettings(): void {
        this._connection.settings.findOrCreate({where: {id: 1}, defaults: {guestNumber: 1, wifiSSID: 'MEETeUX', wifiPassword: 'PasswortOderSo'}}).spread((user, created) =>
        {
            if(!created)
            {
                user.guestNumber = 1;
                user.save();
            }
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

    private async createGermanExhibitContent() {
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
                    content: 'Werter Untertan, wir hören gerne wundersame Geschichten. Dies vertreibt uns neben der Jagd unsere Zeit. Unterhalte uns mit ' +
                        'einer spannenden Erzählung und du wirst belohnt! Um die Gründung des Stifts Klosterneuburg rankt sich die sogenannte "Schleierlegende". ' +
                        'Versuche in diesem Spiel, diese Legende auf einer interaktiven Bühne nachzubauen!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 403,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Erwähnung des heiligen Koloman in den Sunthaym-Tafeln',
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

    private async createEnglishExhibitContent() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.content.create({
                    content: 'Loyal subject, it is we, Maximilian, who welcome you from up here, our throne. During your visit, you are going to be stunned by our ' +
                        'regency as archduke of Austria and Emperor of the Holy Roman Empire and without doubt, by our fascinating history as a sovereign. The age ' +
                        'we lived in may differ from yours but nevertheless it was a time of upheaval and change. Now let yourself be guided, by means of this app, ' +
                        'and explore the late Middle Ages while exciting yourself with suspenseful riddles. Correct answers will win you parts of your personal coat ' +
                        'of arms. A gift we will grant you at the end of your tour. Good Luck!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 1000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Dear friend, it is nice to welcome you at this centre of erudition and scholarship! I, Ladislaus Sunthaym, have studied the ' +
                        'family history of margrave Leopold III, the founder of this very monastery, Klosterneuburg. Emperor Maximilian himself asked me to ' +
                        'produce a family tree out of my findings. What an honour to be part of his sage entourage. I very much love to share my wisdom: Let yourself ' +
                        'be guided by me throughout the exhibition and help me solve the given riddles. Correct answers will win you parts of a personal coat of arms, ' +
                        'which will be granted to you by the Emperor himself',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 1000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Look at them, what a noble crowd: how they show off their jewels and precious gowns while attending their spiffing (grand) ' +
                        'ceremonies. You might have already heard of me, Till Eulenspiegel is the name. I am not always a very welcomed guest as I love to play ' +
                        'tricks and joke around. My spot is offstage, from where I can comment on all events. If you follow me through the exhibition, you will ' +
                        'hear stories only a few elect know of. Let’s solve the given riddles together. Correct answers will reveal parts of a personal coat of arms, ' +
                        'that his royal highness the emperor himself will grant to you. Maybe there will be time for some fooling around too… .',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 1000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Our business was always kept under scrutiny. To guarantee a meticulous record, we kept record books in ' +
                        'which all our expenses were put in. The one you are looking at is provided by the monastery’s archives. We want to ' +
                        'bring its format and dimensions as well as its cover to your attention. The latter is made from an old, reused sheet of ' +
                        'parchment, a recycling method, that was quite usual at the time. We now beseech you to tell us the accumulated value of travel ' +
                        'costs and courier services the monastery had to pay for in the middle of the 15th century.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 101,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Minting of the bad coin "Schinderling"',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 101,
                    year: 1458
                }),
                this._connection.content.create({
                    content: 'Parliament of Klosterneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 101,
                    year: 1465
                }),
                this._connection.content.create({
                    content: 'Subversion by Hungarian Troops arround Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 101,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'Renaissance humanism started to spread throughout Europe and reached our archduchy by the middle of the 15th century. ' +
                        'With the University of Vienna and our own court as the main places for this intellectual movement, some of the Augustinian Canons ' +
                        'from Klosterneuburg had access to what is known as the seven liberal arts. They had been made a precondition to the studies of theology, ' +
                        'medicine or law. One of the Augustinian Canons that studied in Vienna and manufactured his own books was Wolfgang Winthager. After ' +
                        'finishing a course of studies, a certificate, that informed about one’s determination was manufactured. An example can be seen here.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 102,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Lecture held by the Augustinian Canons Wolfgang Winthager and Johannes Swarcz at the University of Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 102,
                    year: 1450
                }),
                this._connection.content.create({
                    content: 'Ladislaus Sunthaym\'s final degree from the University of Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 102,
                    year: 1465
                }),
                this._connection.content.create({
                    content: 'Call of Conrad Celtis to the University of Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 102,
                    year: 1497
                }),
                this._connection.content.create({
                    content: 'Subject! Perceive with your own eyes how exciting and thrilling the 15th century was. A centennial that had everything ' +
                        'in the mix: a good portion of political conflict, a dash of economic crises, a swirl of technical innovation, a good go of new ' +
                        'intellectual movements and standards as well as a new saint for our archduchy of Austria, to the taste – what a time! But see for ' +
                        'yourself! On the left you shall have all political turnpoints that made an impact on Klosterneuburg. To your right, you will follow the ' +
                        'canonization of our estimated ancestor Leopold III',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Oh, there is a very great deal to say about the 15th century, but as I always point out: information is best served in ' +
                        'small portions. That is why I present you some of the most important political events concerning the archduchy of Austria to ' +
                        'your left while you can follow the canonization of the Babenberg margrave Leopold III in 1485 to your right',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Oh my, all this fuzz about politics and fighting and fancy emperors bores me to death! Go on, continue to be ' +
                        'lulled to sleep by some dull facts on the left. Far more interesting is the story of Leopold III. Have you already heard ' +
                        'about the legend of the veil, the origin myth of this very monastery or about the miracles that are attributed to Leopold? If you ' +
                        'care for anecdotes about breathtaking love and miraculous wonders than stick to the right side of the hallway… so exciting!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Long before we, Maximilian, were born into this world, our family engaged in a feud. Brother stood against brother and the ' +
                        'lordship was split. It took a great effort to end this bitter hostility for even our father Frederick III and his brother, our uncle ' +
                        'Albert VI of Austria were bound to this vendetta. Their contention escalated in 1461 and took its toll on the territories below the river ' +
                        'Enns. The rivalry finally ended with our uncle’s sudden death in 1463 and the installment of our father in his rightful place as sovereign ' +
                        'of our beloved duchy of Austria.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'In 1451 after the last direct heir of the Leopoldian bloodline died, political affairs became uncertain. The brothers ' +
                        'Frederick III and duke Albert VI of Austria both claimed their right to the heritage and their already tense demenour culminated ' +
                        'in an armed conflict in 1461. Klosterneuburg was in support of Albert VI, who in return tried to counteract the monastery’s economic ' +
                        'strain by granting it privileges regarding trade and salt. The feud finally ended with the duke’s sudden death and Frederick III`s ' +
                        'installment as sovereign in 1463.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Schinderlings! What an infamous crime! As our sovereigns spent all the money fighting useless wars they started minting bad coins. ' +
                        'All they were interested in was the expansion of their power and influence. Nobody cared about us, the suffering people. The silver in ' +
                        'our shiny little pfennigs was replaced by a cheaper copper and lead, the worth of those coins was next to nothing. The result of this ' +
                        'strike of genius was an unseen economic crisis. Thanks for nothing, my lords! But make no mistake I will get into your pockets, one way or another!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Death of Ladislaus Postumus',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    year: 1457
                }),
                this._connection.content.create({
                    content: 'Death of Albert VI of Austria',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    year: 1463
                }),
                this._connection.content.create({
                    content: 'Outbreak of war between Frederick III and Matthias Corvinus',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2001,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'After our father gained power King Matthias Corvinus of Hungary had the audacity to declare war on him in 1477. Corvinus ' +
                        'united Hungary, secured the borders against the Ottoman Empire and invaded our territory below the Enns river! It was not until ' +
                        'after Corvinus’ death in 1490 that formerly conquered areas were reunited with the rest of our archduchy. Despite all the ' +
                        'unpleasantness he caused, he did support the canonization of Leopold III, we have to give him that.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Matthias Corvinus was elected King of Hungary in 1458. Driven by his ambition he not only united the Hungarian Empire ' +
                        'but conquered parts of the Duchy of Austria including Klosterneuburg in 1483 and Vienna in 1485. I have to admit that I am ' +
                        'euqally impressed by his strategic thinking and his classical education as well as his love for arts. One of the erudites he counted ' +
                        'amongst his entourage was the italian historiograph Antonio Bofini, who compiled a magnificent work on Hungary\'s History.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Oh these sovereigns! All they do is fight all day and try to outsmart each other! Who gathered the wiser erudites? ' +
                        'Who\'s ancestors are the noblest? Who is the sharpest war-lord? As if I cared! The people were suffering. Klosterneuburg lost ' +
                        'Wolfgang Wiesinger, may he rest in peace. His poor soul was swiped off this earth in the conflict between the Habsburgian sleepyhead ' +
                        'Frederick III and the hungarian shooting star Matthias Corvinius.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: ' Matthias Corvinus visits Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    year: 1470
                }),
                this._connection.content.create({
                    content: 'Klosterneuburg ist conquered by the Hungarians',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    year: 1483
                }),
                this._connection.content.create({
                    content: 'Vienna is conquered by the Hungarians',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    year: 1485
                }),
                this._connection.content.create({
                    content: 'Death of Matthias Corvinus in Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2003,
                    year: 1490
                }),
                this._connection.content.create({
                    content: 'Margrave Leopold III was already worshipped shortly after his death. It was our father Frederick III, who once more initiated the ' +
                        'canonization process in 1465 after our noble ancestor Rufolf IV had failed to do so before him. Pope Paul II instated a comission to ' +
                        'investigate Leopold\'s miracle doings and to evaluate his candidacy. During the first papal investigation in Klosterneuburg in 1468, ' +
                        '191 loyal subjects were questioned. A number we are very proud of.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'The worship of Babenberg margrave Leopold III began immediately after his death. Soon his tomb was sought by an increasing number of ' +
                        'pilgrims and the now reigning house of Habsburg gained interest in this iconified monarch. Duke Rudolf IV, (called “the Founder”) initiated ' +
                        'Leopold’s canonization but it was not until the reign of Frederick III that the papal commission started their investigation in 1468 and ' +
                        'questioned over 240 individuals for the next two years. Their statements were put down in writing, authenticated by a notary public and sent ' +
                        'to Rome for further inspections',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'I must share with you the story of my most favorite miracle: there was a woman once that could barely make a living and one day ' +
                        'she was forced to pawn her coat. Very soon afterwards the shylock demanded his money back but she was not able to pay him. In her ' +
                        'time of need she turned to Leopold, who in her dream told her about a treasure. As she couldn’t find it while being awake Leopold ' +
                        'came to her in her dreams once more. After her vision, she retrieved the promised treasure and could not only pay her debt but also ' +
                        'make a living of it. Isn’t this wonderful? Hmmm… I think I should get some rest now… .',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Inquiry of the Witnesses in Klosterneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    year: 1468
                }),
                this._connection.content.create({
                    content: 'Inquiry of the Witnesses in Klosterneuburg',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    year: 1469
                }),
                this._connection.content.create({
                    content: 'Inquiry of the Witnesses at the Klosterneuburger Hof in Vienna',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2002,
                    year: 1470
                }),
                this._connection.content.create({
                    content: 'Subject, patience is a virtue if not a principle and even a monarch has to live by it. Leopold’s canonization took forever. ' +
                        'After the authenticated statements arrived in Rome, Pope Sixtus IV aborted the canonization process because of formalities and had it ' +
                        'redone. It took another 15 years and an enormous financial effort until his successor Pope Innocent VIII finally recognized Leopold’s ' +
                        'sanctity and included him in the Litany of the Saints.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2004,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'The canonization process was a complex one. The requirements for recognizing sanctity did not end with a person’s ' +
                        'declared worthiness but had to fulfill formal standards. Latter being one of the reasons for Leopold’s declaration to ' +
                        'take almost 20 years: bureaucratic errors, enormous costs and involved people dying slowed down the whole process. In the ' +
                        'end, the defense speech held by Franciscus de Pavinis gave the final push. On January 6th, 1485 Leopold was recognized as a ' +
                        'saint during a ceremonial act in St. Peter’s Basilica.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2004,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Oh, look at him! This elegance! This grandeur! In full regalia of a margrave and wearing the hat of an archduke he looks just stunning. ' +
                        'Between you and me: what you see is historically incorrect, because Leopold III was not an archduke but the painting would certainly miss ' +
                        'something if the hat had been left out, don’t you think? And look there in his hand, the tiny model of the monastery, it always catches ' +
                        'my attention. I am sure it is a symbol for his patronage of Klosterneuburg! Ah yes and the halo, very impressive indeed. I would fancy one too. ' +
                        'Would fit me just right! Miracles do happen, you know!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 2004,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Now let us introduce our noble selves: born on the 22nd March 1459 in Wiener Neustadt to our father Frederick III, ' +
                        'who had already been crowned Emperor of the Holy Roman Empire and our mother Eleonore of Portugal, a Portugese infanta. In 1486, we ' +
                        'were crowned King of the Romans and seven years later in 1493 the Habsburg Hereditary Lands were put under our rule. At the Age of 49 ' +
                        'in 1508 we had ourselves crowned Emperor of the Romans in Trient. Tu felix Austria nube! The unparalleled matrimonial policy we implied ' +
                        'during our reign gained us the territories of Bohemia and Hungary.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 3000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Let me introduce Maximilian’s branch of the family tree, I had produced for him. He was the son of ' +
                        'Emperor Frederick III and Eleonora of Portugal. In 1477, he was married to Mary of Burgundy, whose father had just died. ' +
                        'Maximilian, now also duke of Burgundy and his wife had two children: Philipp I, later King of Castile and Margeret, later ' +
                        'Governor of the Habsburg Netherlands. Mary died in 1482 after only five years of marriage and Maximilian was remarried in 1494 ' +
                        'to Bianca Maria Sforza. They had no children.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 3000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Rumor has it, that a bright shining star appeared in the sky just as Maximilian was born in 1459. I know of another child, whose ' +
                        'birth was accompanied by such an astronomic event – you sure know which: yes, of course Jesus. Well, I would call this a nice try to ' +
                        'play the gallery, Maximilian. Chronicles and reports, that were not written by your erudites have no mention of such an event at all. ' +
                        'But still such an announcement is odd, for medieval superstition read a comet as a bad omen.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 3000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'We, Maximilian demand your services, subject! We ordered our secretary Marx Treitzsauerwein, to ' +
                        'write down our biography including all our heroic acts and achievements and have them printed. Help him finish ' +
                        'our Weißkunig story! You will see some woodcut prints that were made by our court artist. Answer the questions ' +
                        'correctly and you will be rewarded generously. Tell our story to our content and you will be promoted to the ranks of nobility.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 301,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Maximilian I is born.',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 301,
                    year: 1459
                }),
                this._connection.content.create({
                    content: 'Maximilian takes part in the assembly of his empire',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 301,
                    year: 1471
                }),
                this._connection.content.create({
                    content: 'Marriage with Mary of Burgundy',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 301,
                    year: 1477
                }),
                this._connection.content.create({
                    content: 'The monastery of Klosterneuburg had a new saint to promote and the provost took good care of it. The first to be Jakob ' +
                        'Paperl elected on the 1st July 1485. He inspired us with his conscientious work of keeping Leopold’s memory alive. Since his ' +
                        'canonization, the missals note the 15th November as Saint Leopold’s celebration day, paintings, manuscripts and prints were made ' +
                        'in his honor. Our commited erudite and genealogist Ladislaus Sunthaym produced a family tree. Listen to what he has to say!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'After Leopold’s canonization, I received the order to conduct a genealogical research on him. To do so I had to travel from one ' +
                        'monastery to the next to consult and evaluate the available historical records. Scientific credibility is an unshakeable premise but I ' +
                        'just could not solve all of the puzzles. It was very challenging to find records regarding spouses and daughters and some relatives of ' +
                        'the margrave have to remain without a name. Of course I dedicated my hard work and findings to someone special. Who that is, I will tell ' +
                        'you shortly.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Good old Sunthaym worked himself to the bone to dust off the Babenberg’s genealogy. ' +
                        'Way over the top, if you ask me. Nobody is ever going to read that, even more so if it is written ' +
                        'on parchment and the letters are minuscule. The panels that were made to illustrate the findings of Sunthaym ' +
                        'were said to be kept behind bars – To read that you had to have eagle eyes. Talking of eagles: did you notice the funny ' +
                        'animals around the tendrils? They are entertaining! Look there is an elephant, but what is it wearing? By the way: all the ' +
                        'Sunthaym panels can be seen in the upper parts of the exhibition.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Sunthayms work is very much to our satisfaction. Not only are these panels appealing in terms of content ' +
                        'but also in terms of appearance. Perceive their beauty, subject! The origins and roots of our ancestors are adorned ' +
                        'with decorations in gold and precious colors. A royal pedigree is always of uttermost importance. That is the reason why ' +
                        'we asked Sunthaym to conduct the research on our family in the first place. He was not the only one working on this task.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Ah yes, the dedication! Of course, I dedicated all my work to the Holy Lord, the Virgin Mary and ' +
                        'Saint Leopold himself. I am a clergyman for what it’s worth! But of course, I had to name Emperor ' +
                        'Frederick and his son Maximilian and all their titles too as well as the Provost Jakob Paperl, they are my patrons. The ' +
                        'manner in which I formulated this dedication can be seen a few steps farther. It’s all there in pure accuracy and extreme ' +
                        'precision. It is as I always say: “Do it and do it right!”.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4001,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'What a bootlicker, this Sunthaym person! Everything is so neat and tidy! Look at it, of course he named ' +
                        'God and the Sovereign and the Provost in his dedication, Mr. Perfect. This way he sure gained the Emperor’s goodwill. ' +
                        'Me on the other hand, I prefer less effort and higher rewards. You doubt that I could pull that off? Go upstairs and see for yourself.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4001,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'Look at this! One of the eight splendid Sunthaym Panels. These sheets of parchment tell the story of 75 members of the ' +
                        'Babenberg Family, men and women that are introduced by an initial, a marvelous decorated first letter. The capital G is the first ' +
                        'letter of the colophon, which is a brief dedication statement. Position your mobile phone above the big initials to read the text.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 402,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Loyal subject, we love to be amused by miraculous storys. They keep us entertained while we are not out on a hunt. ' +
                        'Go on, continue to please us with a good story. You shall be rewarded. As you know the Legend of the Veil is connected to ' +
                        'the foundation of the Monastery of Klosterneuburg. Try to reenact it on this interaktive stage.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 403,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Mentioning of Saint Koloman in the Sunthaym Panels',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 403,
                    year: 1491
                }),
                this._connection.content.create({
                    content: 'Illustration of the Legend of the Bow in the Babenberg Family Tree',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 403,
                    year: 1492
                }),
                this._connection.content.create({
                    content: 'The Frueauf Panels showing the Legend of the Veil are being manufactured',
                    order: 2,
                    contentTypeId: contentTypes.EVENT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 403,
                    year: 1505
                }),
                this._connection.content.create({
                    content: 'Subject! Can you appreciate the splendor of these panels made by Rueland Frueauf the Younger? They show the legend regarding the ' +
                        'foundation of the monastery by our ancestor Leopold III. He was a powerful ruler and a skilled hunter, just like us! It was during a ' +
                        'hunt that he retrieved Agnes’ long before lost veil in an elderberry bush. The veil was undamaged and to complete this miraculous event, ' +
                        'the Virgin Mother Mary appeared before him. In eternal thankfulness, he had Klosterneuburg built on the exact same spot.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4004,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'These panels are the first to show us the legend regarding the foundation of the Monastery by our holy margrave in successive ' +
                        'images, Rueland Frueauf the younger, signed it “RF”. The painter portrayed Leopold various times including the one with the margrave ' +
                        'holding a model of the Monestary in his hands. The artist’s wife Dorothea is mentioned in the obituary.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4004,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'What a noble man on a noble steed and he is doing what noble men always do in their spare time, he hunts. I know nothing ' +
                        'about hunting but I have a good feeling about those fierce men that are accompanying him and about the dogs. Look, they are there ' +
                        'as Leopold retrieves Agnes’ veil. Rumor has it, that all the dogs, that were held in cages in Klosterneuburg are direct descendants ' +
                        'of the canine companions that shared this holy moment.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 4004,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'What a fabulous day! On February 15, 1506, more than twenty years after his canonization Leopold’s remains were transferred ' +
                        'during a relic translation ceremony. We amongst other members of our court and many of our subjects were present to be part of ' +
                        'this exceptional occasion. We put a lot of thought into our wardrobe and decided to deliberately step away from waring our regalia ' +
                        'and chose the robe of the archduke in respect to our holy ancestor and our beloved archduchy of Austria.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 5000,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'The canonization process is officially brought to an end by a socalled relic translation ceremony during which the mortal ' +
                        'remains of the recognized saint are transferred. In Leopold’s case this happened very late. First It was the Hungarians, who with ' +
                        'their reign over Klosterneuburg made it impossible for the Habsburg family to take part in a ceremony and then it was King Maximilian I, ' +
                        'who was wound up in his state’s affairs that he could not personally take part. That is why it head to be postponed until February 1505 ' +
                        'but it sure was worth the wait!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 5000,
                    storyTellerId: storytTellers.SUNTHAYM
                }),
                this._connection.content.create({
                    content: 'Boy, what a day! It was spectacular! All these people, the food, the atmosphere! Even the archduke showed himself even though he ' +
                        'had a lot on his back lately! But hey I could make it so he should better make it too. After the canonization, they revealed the ' +
                        'gigantic Babenberg family tree. I wonder where they left my invitation… ',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 5000,
                    storyTellerId: storytTellers.TILL
                }),
                this._connection.content.create({
                    content: 'To grant our new Saint the honor he deserves, our father and we had him built a special shrine. For that occasion, our father ' +
                        'requested silver to be worked into the coffin from our cousin Sigismund’s silver mines in Tyrol. Klosterneuburg was given the order to ' +
                        'manufacture the artifact out of the precious raw materials that were provided by our smelting works in Tyrol. The splendid coffin weighed ' +
                        '436,5 Mark Silver and Leopold’s mortal remains found their final resting place in 1506.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 501,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Faithful subject, I shall now receive you in audience. You proved yourself a helpful servant while solving the riddles and ' +
                        'you earned yourself a reward. In accordance with your rank you shall now be granted your personal coat of arms. Thus, you are made ' +
                        'a member of our court and are privileged to explore additional premises. Proceed to the upper parts of the exhibition to learn more ' +
                        'about our faible for memoria an earn additional parts to your coat of arms. You shall leave now!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 5001,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'There they are, the noble ancestors of the magnificent House of Habsburg. You can find Saint Leopold up there as ' +
                        'well as some of his 18 children. His son Henry II of Austria, called Jasomirgott, was the first duke of Austria. All the ' +
                        'other Babenbergs have interesting biographies too. Some were fighting wars, some set sail for the Holy Land, some mediated in ' +
                        'terms of affairs regarding the Empire and others were married in order to broaden power and influence. Find out, when and where ' +
                        'the Babenbergs lived, who they were married too and how they named their sons and daughters.',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 502,
                    storyTellerId: storytTellers.MAXIMILIAN
                }),
                this._connection.content.create({
                    content: 'Subject, you have now laid eyes on the upper part of the exhibition. Tell me, are you impressed by all the ends and means we used to ' +
                        'keep the memoria alive? By visiting this exhibition, you too guarantee the ongoing tradition of our memory, which we are very grateful for. ' +
                        'As a final reward, we compensate you with the upgrade of your coat of arms. Wear it with pride and vigor. Make sure you are remembered!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
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
                    ipAddress: '0.0.0.0',
                    isStartPoint: true
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
                    titleENG: "The Emperor's new Saint",
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
                    titleENG: 'Conflict and Canonization',
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
                    titleENG: 'Maximilian I',
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
                    titleENG: 'The Monastery and the Provost',
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
                    titleENG: 'Relocating the mortal remains',
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
                    titleENG: 'Commemoration',
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
                    titleENG: 'Coins and Governance',
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
                    titleENG: 'Science and University',
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
                    titleENG: 'Understanding Sunthaym',
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
                    titleENG: 'Final Resting Place',
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
                    titleENG: 'Weißkunig Quiz ',
                    contentURL: 'tableat',
                    ipAddress: '10.10.11.3',
                    locationTypeId: locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 15,
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1519,
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
                    titleENG: 'Once upon a time..',
                    contentURL: 'tableNotifyAt',
                    ipAddress: '10.10.11.5',
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
                        contentURL: 'tableNotifyOn',
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
                        titleENG: 'The Babenberg Pedigree',
                        contentURL: 'tableNotifyAt',
                        ipAddress: '10.10.11.6',
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
                        ipAddress: '10.10.11.7',
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
                        ipAddress: '10.10.11.8',
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
                    titleGER: 'Familienzwist',
                    titleENG: 'Family Feud',
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
                    titleENG: 'Miracle and Witnesses',
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
                    titleENG: 'Matthias Corvinus',
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
                    titleENG: 'Saint Leopold',
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
                    titleENG: 'Sunthaym\'s research',
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
                    titleENG: 'The Legend of the Veil',
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
                    titleENG: 'In Audience with the Emperor',
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
                }),
                this._connection.neighbor.create({
                    prevLocation: 2000,
                    nextLocation: 2001
                }),
                this._connection.neighbor.create({
                    prevLocation: 402,
                    nextLocation: 403
                }),
                this._connection.neighbor.create({
                    prevLocation: 403,
                    nextLocation: 4004
                }),
                this._connection.neighbor.create({
                    prevLocation: 4004,
                    nextLocation: 5000
                }),
                this._connection.neighbor.create({
                    prevLocation: 5000,
                    nextLocation: 501
                }),
                this._connection.neighbor.create({
                    prevLocation: 501,
                    nextLocation: 5001
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

    private async createiOSSubmissionUser()
    {
        const identifier: string = 'iOSSubUser';
        const deviceAddress: string = 'some address';
        const deviceOS: string = 'iOS';
        const deviceVersion: string = '12.1.4';
        const deviceModel: string = 'iPhone';
        const email: string = 'fake@mail.com';
        const password: string = 'apple';
        const language: number = 1;

        return this._odController.registerOD({identifier, deviceAddress, deviceOS, deviceVersion, deviceModel, email, password, language}, 'not set').then( (result) =>
        {
            const user = result.data.user;

            if(!user) return;

            // unlock all locations in timeline
            this._locationController.registerTimelineUpdate({user: user.id, location: 1000}).then( () => {
                this._locationController.registerTimelineUpdate({user: user.id, location: 101}).then( () => {
                    this._locationController.registerTimelineUpdate({user: user.id, location: 102}).then( () => {
                        this._locationController.registerTimelineUpdate({user: user.id, location: 2000});
                    });
                });
            });

            this._locationController.registerTimelineUpdate({user: user.id, location: 2001});
            this._locationController.registerTimelineUpdate({user: user.id, location: 2002});
            this._locationController.registerTimelineUpdate({user: user.id, location: 2003});
            this._locationController.registerTimelineUpdate({user: user.id, location: 2004});

            this._locationController.registerTimelineUpdate({user: user.id, location: 3000});
            this._locationController.registerTimelineUpdate({user: user.id, location: 301});

            this._locationController.registerTimelineUpdate({user: user.id, location: 4000});
            this._locationController.registerTimelineUpdate({user: user.id, location: 4001});
            this._locationController.registerTimelineUpdate({user: user.id, location: 402});
            this._locationController.registerTimelineUpdate({user: user.id, location: 403});
            this._locationController.registerTimelineUpdate({user: user.id, location: 4004});

            this._locationController.registerTimelineUpdate({user: user.id, location: 5000});
            this._locationController.registerTimelineUpdate({user: user.id, location: 501});
            this._locationController.registerTimelineUpdate({user: user.id, location: 502});
            this._locationController.registerTimelineUpdate({user: user.id, location: 5001});

            this._locationController.registerTimelineUpdate({user: user.id, location: 6000});

            // unlock all coa parts
            this._coaController.unlockCoaPart({userId: user.id, coaId: 10});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 11});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 12});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 13});

            this._coaController.unlockCoaPart({userId: user.id, coaId: 20});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 21});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 22});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 23});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 24});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 25});

            this._coaController.unlockCoaPart({userId: user.id, coaId: 30});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 31});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 32});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 33});

            this._coaController.unlockCoaPart({userId: user.id, coaId: 40});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 41});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 42});
            this._coaController.unlockCoaPart({userId: user.id, coaId: 43});
        });
    }

    set connection(value: any) {
        this._connection = value;
    }
}