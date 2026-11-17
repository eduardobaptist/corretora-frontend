"use client";

import { Avatar, Button, Chip, Table } from "@heroui/react";
import { AcaoIcone } from "@/components/admin/acao-icone";
import { ConfirmarAcao, ConfirmarExclusao } from "@/components/admin/confirmar-exclusao";
import { ListaContagem, ListaToolbar, ListaVazia } from "@/components/admin/lista-estados";
import {
  ListaBusca,
  ListaPaginacao,
  ListaProvider,
  ListaResultados,
  useLista,
} from "@/components/admin/lista-navegacao";
import { useAlvo } from "@/components/admin/use-alvo";
import { Pencil, PersonGear, Persons, Plus, TrashBin } from "@/components/icons";
import { iniciais } from "@/features/auth/utils";
import type { Page } from "@/lib/api";
import type { ListaParams } from "@/lib/lista";
import { excluirUsuario, trocarPerfil } from "../actions";
import { ROTULO_PERFIL, type Usuario } from "../types";
import { UsuarioForm } from "./usuario-form";

interface UsuariosTabelaProps {
  page: Page<Usuario>;
  params: ListaParams;
  /** id do admin logado (não pode se excluir nem trocar o próprio perfil) */
  meuId: number;
}

export function UsuariosTabela({ params, ...props }: UsuariosTabelaProps) {
  return (
    <ListaProvider params={params}>
      <UsuariosConteudo {...props} />
    </ListaProvider>
  );
}


function UsuariosConteudo({ page, meuId }: Omit<UsuariosTabelaProps, "params">) {
  const { params, navegar } = useLista();
  const form = useAlvo<Usuario>();
  const perfil = useAlvo<Usuario>();
  const exclusao = useAlvo<Usuario>();
  const { content, page: meta } = page;

  const botaoNovo = (
    <Button variant="primary" className="w-full sm:w-auto" onPress={() => form.abrir()}>
      <Plus className="size-4" aria-hidden />
      Novo usuário
    </Button>
  );

  const vazio = () => {
    if (params.q) {
      return (
        <ListaVazia
          icone={Persons}
          titulo={`Nenhum usuário encontrado para “${params.q}”`}
          dica="Confira a grafia ou busque por outro nome ou e-mail."
          acao={<Button variant="secondary" onPress={() => navegar({ q: "" })}>Limpar busca</Button>}
        />
      );
    }
    if (meta.totalElements > 0) {
      return (
        <ListaVazia
          icone={Persons}
          titulo="Página não encontrada"
          dica={`A lista tem ${meta.totalPages} página(s).`}
          acao={<Button variant="secondary" onPress={() => navegar({ pagina: 1 })}>Ir para a primeira página</Button>}
        />
      );
    }
    return <ListaVazia icone={Persons} titulo="Nenhum usuário cadastrado" dica="Cadastre o primeiro acesso." acao={botaoNovo} />;
  };

  const promover = perfil.item?.role !== "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <ListaToolbar acao={botaoNovo}>
        <ListaBusca label="Buscar usuários" placeholder="Buscar por nome ou e-mail…" />
        <ListaContagem
          total={meta.totalElements}
          singular={params.q ? "usuário encontrado" : "usuário"}
          plural={params.q ? "usuários encontrados" : "usuários"}
        />
      </ListaToolbar>

      <ListaResultados>
        {content.length === 0 ? (
          vazio()
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Usuários" className="min-w-[40rem]">
                <Table.Header>
                  <Table.Column isRowHeader>Usuário</Table.Column>
                  <Table.Column>E-mail</Table.Column>
                  <Table.Column>Perfil</Table.Column>
                  <Table.Column className="text-end">Ações</Table.Column>
                </Table.Header>
                <Table.Body items={content}>
                  {(usuario) => {
                    const proprio = usuario.id === meuId;
                    return (
                      <Table.Row id={usuario.id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" color={usuario.role === "ADMIN" ? "accent" : "default"}>
                              <Avatar.Fallback>{iniciais(usuario.nome)}</Avatar.Fallback>
                            </Avatar>
                            <span className="font-medium">{usuario.nome}</span>
                            {proprio && (
                              <Chip size="sm" variant="secondary">
                                Você
                              </Chip>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-muted">{usuario.email}</Table.Cell>
                        <Table.Cell>
                          <Chip size="sm" variant="soft" color={usuario.role === "ADMIN" ? "accent" : "default"}>
                            {ROTULO_PERFIL[usuario.role]}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end gap-1">
                            <AcaoIcone label={`Editar ${usuario.nome}`} onPress={() => form.abrir(usuario)}>
                              <Pencil className="size-4" aria-hidden />
                            </AcaoIcone>
                            <AcaoIcone
                              label={
                                proprio
                                  ? "Você não pode trocar o próprio perfil"
                                  : usuario.role === "ADMIN"
                                    ? `Tornar ${usuario.nome} cliente`
                                    : `Tornar ${usuario.nome} administrador`
                              }
                              isDisabled={proprio}
                              onPress={() => perfil.abrir(usuario)}
                            >
                              <PersonGear className="size-4" aria-hidden />
                            </AcaoIcone>
                            <AcaoIcone
                              label={proprio ? "Você não pode excluir a si mesmo" : `Excluir ${usuario.nome}`}
                              isDisabled={proprio}
                              onPress={() => exclusao.abrir(usuario)}
                            >
                              <TrashBin className={`size-4 ${proprio ? "" : "text-danger"}`} aria-hidden />
                            </AcaoIcone>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  }}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
        <ListaPaginacao page={meta} />
      </ListaResultados>

      <UsuarioForm key={form.chave} usuario={form.item} meuId={meuId} aberto={form.aberto} onFechar={form.fechar} />

      <ConfirmarAcao
        aberto={perfil.aberto}
        onFechar={perfil.fechar}
        status="accent"
        titulo={promover ? "Tornar administrador?" : "Tornar cliente?"}
        rotuloConfirmar={promover ? "Tornar administrador" : "Tornar cliente"}
        rotuloPendente="Salvando…"
        icone={<PersonGear className="size-4" aria-hidden />}
        onConfirmar={() => trocarPerfil(perfil.item!.id)}
      >
        <strong className="text-foreground">{perfil.item?.nome}</strong>{" "}
        {promover
          ? "passará a acessar a área de administração, com permissão para alterar todos os cadastros."
          : "perderá o acesso à administração e passará a usar a área do cliente."}{" "}
        Se a pessoa estiver logada, precisará entrar de novo.
      </ConfirmarAcao>

      <ConfirmarExclusao
        aberto={exclusao.aberto}
        onFechar={exclusao.fechar}
        titulo="Excluir usuário?"
        onConfirmar={() => excluirUsuario(exclusao.item!.id)}
      >
        A conta de <strong className="text-foreground">{exclusao.item?.nome}</strong> ({exclusao.item?.email})
        será excluída e a pessoa não poderá mais entrar. Isso não pode ser desfeito.
      </ConfirmarExclusao>
    </div>
  );
}
