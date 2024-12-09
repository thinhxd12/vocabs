import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import { Buffer } from "buffer";

const LayoutImageLoader: Component<{ src: string }> = (props) => {
  const defaultPlaceholder =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAgCAYAAADjaQM7AAAORklEQVR4AQBtAJL/AIytv/+Pr8D/lLPD/5u3xv+hu8f/pr7H/6q/xf+rvsD/rLu7/6y5tf+tt7H/r7eu/7K4rf+1u67/ub6w/7zBsv+9wrP/vcK0/7vBs/+3v7L/s72x/7C7sP+uurH/rLqy/6y7s/+su7X/rLy2/wBtAJL/AI+uv/+RsMH/l7TE/525xv+jvcj/qL/I/6zAxf+tv8H/rr27/666tv+vuLH/sbiu/7S5rf+3vK7/u7+w/77Csv+/w7T/v8O0/73CtP+5wLP/tb6y/7K8sf+vu7H/rruy/668tP+uvbX/rr22/wBtAJL/AJOxwP+Vs8L/m7fF/6G7x/+nv8n/rMLJ/6/Cxv+xwcL/sr+8/7K8t/+yurL/tLqv/7e7rv+7vq//vsGw/8HDsv/DxbT/wsW1/8DEtP+9wrP/ucCy/7a+sv+zvbL/sr2z/7G+tP+xvrb/sb+3/wBtAJL/AJi0wf+btsP/oLrG/6a+yP+swsr/scTJ/7TFx/+2xML/tsG9/7a/t/+3vbL/uLyv/7u9rv+/wK//wsOw/8XFsv/Hx7T/xse0/8TGtP/BxLP/vcKy/7rAsv+3v7L/tr+z/7XAtP+1wLb/tcG2/wBtAJL/AJ22wv+gucP/pbzG/6vByP+xxMr/tsfJ/7nHx/+7xsL/u8O8/7vBtv+7v7H/vb6u/7+/rf/Dwa3/xsSv/8nGsf/LyLL/ysiz/8jIs//FxrL/wsSx/77Csf+8wbH/usGy/7nBs/+5wrT/ucK1/wBtAJL/AKK4wf+lusL/qr7E/7DCx/+2xsj/usjH/77Ixf+/x8D/v8S6/7/BtP+/v6//wL6r/8O/qv/Gwar/ycSs/8zGrv/OyK//zciw/8zIsP/Jxq//xcSu/8LCrv+/wa7/vsGv/73BsP+9wrH/vcKy/wBtAJL/AKa5vv+pu7//rr7B/7PCxP+5xsX/vsjE/8HIwf/Cxrz/wsS2/8LBsP/Cvqr/w72n/8W9pf/Iv6X/y8Kn/87EqP/Pxqr/z8er/87Gq//Lxar/yMOq/8TBqf/CwKn/wL+q/7/Aq/++wKz/vsCs/wBtAJL/AKm4uf+surv/sL29/7bBv/+7xL//wMa+/8LGu//DxLb/w8Gw/8O+qv/Du6T/xLqg/8a6nv/IvJ7/zL6f/87Bof/Qw6P/0MOk/87DpP/MwqT/ycCj/8W+o//DvaP/wbyj/8C8pP+/vaX/v72l/wBtAJL/AKq1tP+tt7X/sbq3/7e+uP+8wbn/wMO4/8PCtP/Ewa//w72p/8O6ov/Dt53/w7aZ/8W2lv/It5b/y7qX/828mf/Pvpv/z7+c/86/nP/Mvpz/yLyb/8W6m//DuZv/wLib/7+4nP++uJ3/vrid/wBtAJL/AKuyrf+ttK7/sbev/7a6sf+7vbH/v76w/8K+rP/DvKf/w7mh/8K1mv/Cs5T/wrGQ/8Sxjv/Gso3/ybSO/8y3kP/OuZL/zrqT/826lP/LuZT/yLeT/8W2k//CtJP/wLOT/76zk/+9s5T/vbOU/wBtAJL/AKuupv+tsKf/sbOo/7a2qv+6uKr/vrqo/8G5pP/Bt5//wbSZ/8Gxkv/Aroz/wayI/8Kshv/FrYX/yK+G/8qyiP/MtIr/zbWL/8y1jP/KtYz/x7OM/8SyjP/BsIv/v6+L/72ui/+8roz/u66M/wBtAJL/AKqroP+srKH/sK+i/7Wyo/+5tKP/vbWh/7+1nf/As5j/wLCS/7+si/+/qoX/wKiB/8Gof//EqX7/x6t//8mtgf/LsIP/zLGE/8yyhv/KsYb/x7CG/8Svhv/BrYX/v6yF/72rhf+7qoX/u6qF/wBtAJL/AKqom/+sqZv/r6yc/7Sunf+4sZ3/vLKb/76xmP+/r5L/v6yM/7+phv+/p4D/wKV8/8Glev/Epnn/x6h6/8qrfP/MrX7/za+A/82wgf/LsIL/ya+C/8atgv/Dq4H/wKqB/76pgP+8qID/u6eA/wBtAJL/AKqml/+sp5j/r6mY/7Osmf+4rpn/u6+X/76vk/+/rY//wKuJ/8Cog//ApX3/waR5/8Kkd//FpXb/yKd3/8uqef/NrXz/z69+/8+wf//NsID/y6+A/8itgP/FrID/wqp//7+ofv++p37/vad+/wBtAJL/AKqllf+sppX/r6iW/7Oql/+3rJb/u66V/76ukf/ArI3/wKqH/8Gogv/Bpn3/w6V5/8Wld//Hpnb/yqh3/82ref/Qrnz/0bB+/9KxgP/RsYH/zrGB/8yvgf/IrYD/xat//8Kqf//AqH7/v6h+/wBtAJL/AKqklP+spZX/r6eW/7Oqlv+3rJb/u62U/76tkf/ArI3/wquI/8Opg//Ep37/xad7/8enef/KqHj/zat5/9Cue//TsH7/1bOA/9W0gv/UtIP/0rSE/8+yg//MsIP/yK6C/8asgf/Dq4D/wqp//wBtAJL/AKqklf+rpZb/rqeW/7Oqlv+3rJb/u62V/76ukv/Bro7/w6yK/8Wrhf/GqoH/yKp+/8qqfP/Nq3z/0K59/9Oxf//Ws4H/2LaE/9i3hv/XuIf/1reI/9O2h//Ps4b/zLGF/8ivhP/GroP/xa2C/wBtAJL/AKmll/+qppf/rqeY/7KqmP+2rJj/uq6X/76vlP/Cr5H/xK6N/8auif/IrYb/yq2D/82tgf/Pr4D/0rGB/9W0g//Ytob/2rmI/9q6iv/au4v/2LqM/9W5jP/Rt4v/zrSJ/8qyiP/IsIf/x6+G/wBtAJL/AKelmf+pppn/rKia/7Cqmv+1rJr/ua6Z/72wl//BsJX/xLCR/8ewjv/JsIr/y7CI/86whv/RsoX/07OG/9a2iP/ZuIr/2ruM/9u8jv/avY//2LyQ/9a7kP/SuY//zraN/8u0jP/Isor/x7GK/wBtAJL/AKWlnP+mppz/qaed/62qnf+yrJ3/t66c/7ywm//AsZj/w7KW/8aykv/Jso//y7KN/86yi//Qs4r/07WK/9W3i//XuY3/2buP/9m9kf/ZvZP/172T/9S8k//RupL/zbeR/8m1j//Hs47/xbKN/wBtAJL/AKGkn/+jpZ//pqef/6qpoP+urKD/tK6f/7iwnv+9spz/wbOa/8Szl//Hs5T/yrOR/8yzj//OtI7/0LWO/9K3jv/UuZD/1bqS/9W8lP/VvJX/07yW/9G7lv/NuZX/yreT/8a0kv/EspH/wrGQ/wBtAJL/AJ2jov+epKL/oaai/6Woo/+qq6P/r62i/7Svof+5saD/vrKe/8Gzm//Es5j/xrOV/8izk//Ks5H/y7SQ/821kP/OtpH/z7iT/8+5lf/Pupb/zrqX/8u5l//It5f/xbWV/8GzlP+/sZP/vbCS/wBtAJL/AJeipf+Zo6X/nKSl/6Cmpf+kqaX/qqyl/6+upP+0sKP/ubGh/7yynv+/spv/wbKY/8Oylf/EsZP/xbGR/8aykf/Gs5L/x7ST/8i1lf/Htpb/xraX/8S1mP/BtJf/vrKX/7uwlf+5rpT/t66U/wBtAJL/AJGgp/+Toaf/lqKn/5mkp/+ep6f/o6mn/6mspv+urqX/s7Cj/7awof+5sJ3/u7Ca/7yvl/+8rpT/va2S/72tkf+9rZH/vq6S/76wk/++sZX/vbGX/7yxmP+5sJj/t6+X/7Stlv+yq5b/sauV/wBtAJL/AIueqf+Mnqn/j6Cp/5Oiqf+XpKn/nKap/6KpqP+nq6f/rK2l/7Ctov+yrZ//s6yb/7Srl/+0qZP/s6iR/7Onj/+zp4//s6iQ/7Spkf+0q5P/tKyV/7Osl/+xrJj/r6uY/62pl/+rqJf/qqiW/wBtAJL/AISbq/+Fm6v/iJ2q/4ueqv+Qoar/laOq/5umqf+gqKj/pKmm/6iqo/+qqZ//q6ib/6umlv+qpJL/qaKP/6igjf+ooIz/qKGN/6mij/+qpJH/qqaU/6mnlv+op5f/p6eY/6WmmP+kpZj/o6WX/wBtAJL/AH2YrP9+mKv/gZmr/4Sbq/+Inar/jZ+q/5Oiqf+YpKj/naWm/6Cmo/+ipZ//oqOa/6Kglf+gnpD/n5uM/56Ziv+dmYn/npqK/56bjP+fno7/oKCS/6GhlP+gopb/n6OY/56jmP+dopn/nKKZ/wBtAJL/AHaUrP93laz/epar/32Xq/+Bmar/hpup/4ueqf+RoKf/laGl/5ihov+aoJ3/mp6Y/5mbk/+Xl47/lZWJ/5SThv+TkoX/k5OG/5SViP+Wl4z/l5qP/5ick/+Znpb/mJ+Y/5igmf+XoJn/l5+a/wBtAJL/AHCRrP9xkav/c5Kr/3aUqv97lan/f5ip/4WaqP+KnKb/jp2k/5GdoP+SnJz/kpmW/5GWkf+Okov/jI+G/4qMg/+KjIL/io2D/4uPhf+Nkon/kJWN/5GYkv+Sm5X/k5yY/5Odmf+SnZr/kp2b/wBtAJL/AGuOq/9sjqv/bo+q/3GQqf91kqn/epSo/3+Wp/+EmKX/iJmj/4uZn/+MmJr/jJWV/4qRjv+HjYn/hYqE/4OHgP+Chn//g4eA/4SKg/+HjYf/iZGM/4yVkP+NmJT/jpqY/46bmv+OnJv/jpyb/wBtAJL/AGeMq/9ojKr/ao2q/22Oqf9xkKj/dpKn/3uUpv+AlqT/hJei/4eWnv+IlZn/h5KT/4WOjf+Ciof/gIaC/36Dfv99g33/foR+/3+Ggf+CioX/hY6L/4iSkP+KlpT/i5iY/4yamv+Mm5v/jJuc/wFtAJL/AGWLqv9mi6r/aIyp/2uNqP9vj6f/dJGm/3mTpf9+lKT/gpWh/4SVnf+Fk5j/hZCS/4OMjP+AiIb/fYSA/3uCff96gXz/e4J9/32FgP+AiIX/g42K/4aRj/+IlZT/iZeX/4qZmv+Kmpz/ipqc/+JPEYhact9cAAAAAElFTkSuQmCC";
  const [isLoaded, setIsLoaded] = createSignal<boolean>(false);
  const [placeholderData, setPlaceholderData] =
    createSignal<string>(defaultPlaceholder);
  const [placeholderBlurData, setPlaceholderBlurData] =
    createSignal<string>(defaultPlaceholder);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const createThumbhash = async (imageUrl: string) => {
    "use server";
    const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(90, 90, { fit: "inside" });
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
    return Buffer.from(binaryThumbHash).toString("base64");
  };

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setIsLoaded(false);
          setPlaceholderData("");
          const thumbhash = await createThumbhash(props.src);
          const thumbHashFromBase64 = Buffer.from(thumbhash, "base64");
          const dataUrl = thumbHashToDataURL(thumbHashFromBase64);
          setPlaceholderData(dataUrl);
          setPlaceholderBlurData(dataUrl);
        }
      },
    ),
  );
  return (
    <div class="relative flex h-full w-full items-center justify-center overflow-hidden">
      <img
        src={placeholderBlurData()}
        class="absolute z-10 h-full w-full object-cover"
      />

      <img
        class="absolute left-1/2 top-1/2 z-10 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 object-contain"
        src={props.src}
        alt="main-image"
        onLoad={handleLoad}
        style={{
          opacity: isLoaded() ? 1 : 0,
          filter: "drop-shadow(-9px 18px 6px rgba(0, 0, 0, 0.9))",
        }}
      />

      <Show when={placeholderData()}>
        <img
          class="absolute left-1/2 top-1/2 z-20 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 object-contain"
          src={placeholderData()}
          alt="placeholder"
          style={{
            opacity: isLoaded() ? 0 : 1,
            filter: "drop-shadow(-9px 18px 6px rgba(0, 0, 0, 0.9))",
          }}
        />
      </Show>
    </div>
  );
};

export default LayoutImageLoader;
